import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Plus } from 'lucide-react';
import AsyncSelect from 'react-select/async';

export default function OpTourAddCustomerModal({ isOpen, onClose, onSave, initialData }) {
  // Auto-generate B-XXXX (4-5 digits) for a new booking code
  const generateReservationCode = () => `B-${Math.floor(10000 + Math.random() * 90000)}`;

  const [bookingInfo, setBookingInfo] = useState({
    search: '',
    name: '',
    phone: '',
    agentTA: 'Chọn',
    agentCode: '',
    gender: 'Nữ',
    reservationCode: generateReservationCode(),
    pickup: '',
    dropoff: '',
    bank: 'Chọn',
    branch: 'Chi Nhánh'
  });

  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddPhone, setQuickAddPhone] = useState('');

  const handleCreateQuickCustomer = async () => {
    if (!quickAddName.trim() || !quickAddPhone.trim()) {
      alert("Vui lòng nhập Tên và SĐT khách hàng!");
      return;
    }
    try {
      const res = await axios.post('/api/customers', {
        name: quickAddName,
        phone: quickAddPhone,
        customer_segment: 'New Customer'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const newCust = res.data;
      selectCustomer(newCust); // Set ID, search term, and UI instantly
      setIsQuickAdd(false);
      setQuickAddName('');
      setQuickAddPhone('');
      alert("Tạo Khách hàng mới thành công và đã tự động chọn!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo mới khách hàng.");
    }
  };

  const loadCustomerOptions = async (inputValue) => {
     if (!inputValue || inputValue.trim().length < 2) return [];
     try {
       const res = await axios.get('/api/customers?search=' + encodeURIComponent(inputValue), {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       });
       const data = res.data?.data || res.data;
       return data.map(c => ({
         value: c.id,
         label: `${c.name} - ${c.phone}`,
         customer: c
       }));
     } catch (err) {
       console.error("Lỗi tải DS khách hàng:", err);
       return [];
     }
  };


  const selectCustomer = (cust) => {
    setBookingInfo({
      ...bookingInfo,
      customerId: cust.id,
      search: cust.phone || cust.name || '',
      name: cust.name || '',
      phone: cust.phone || '',
      gender: cust.gender || 'Nữ'
    });
    
    // Auto fill first member without destroying other slots
    setMembers(prev => {
      const newMembers = [...prev];
      const memberData = {
        phone: cust.phone || '', name: cust.name || '', gender: cust.gender || 'Chọn',
        dob: cust.birth_date ? cust.birth_date.split('T')[0] : '', docId: cust.id_card || '', 
        expiryDate: cust.id_expiry ? cust.id_expiry.split('T')[0] : ''
      };
      
      if (newMembers.length > 0) {
        newMembers[0] = { ...newMembers[0], ...memberData };
      } else {
        newMembers.push({
          id: Date.now(),
          ageType: 'Adult - Ngu...', docType: 'CMTND', issueDate: '',
          flightOut: '', flightIn: '', visaStatus: '-Chọn-', visaSubmit: '', visaResult: '',
          note: '', roomType: '-Chọn-', hotel: '', roomCode: '',
          ...memberData
        });
      }
      return newMembers;
    });

    setShowSearchDropdown(false);
  };

  const defaultPricingRows = [
    { id: 1, ageType: 'Người lớn', name: '', price: 25490000, qty: 1, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 25490000, internalNote: '', customerNote: '', extraServices: [] },
    { id: 2, ageType: 'Trẻ em (6 - 11)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '', extraServices: [] },
    { id: 3, ageType: 'Trẻ em (2 - 5)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '', extraServices: [] },
    { id: 4, ageType: 'Trẻ nhỏ', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '', extraServices: [] },
  ];

  const [pricingRows, setPricingRows] = useState(defaultPricingRows);

  const [members, setMembers] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
       if (initialData) {
          const raw = initialData.raw_details || {};
          setBookingInfo(raw.bookingInfo || {
            search: initialData.phone || initialData.name || '', 
            name: initialData.name || '', 
            phone: initialData.phone || '', 
            agentTA: 'Chọn', agentCode: '',
            gender: 'Nữ', reservationCode: generateReservationCode(), pickup: '', dropoff: '',
            bank: 'Chọn', branch: 'Chi Nhánh'
          });
          const initialRows = raw.pricingRows || [
            { id: 1, ageType: 'Người lớn', name: '', price: initialData.base_price || 25490000, qty: initialData.qty || 1, surcharge: initialData.surcharge || 0, discount: initialData.discount || 0, comPerPax: 0, comCTV: 0, total: initialData.total || 25490000, internalNote: '', customerNote: '', extraServices: [] },
            { id: 2, ageType: 'Trẻ em (6 - 11)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '', extraServices: [] },
            { id: 3, ageType: 'Trẻ em (2 - 5)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '', extraServices: [] },
            { id: 4, ageType: 'Trẻ nhỏ', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '', extraServices: [] },
          ];
          setPricingRows(initialRows.map(r => ({ ...r, extraServices: r.extraServices || [] })));
          setMembers(raw.members || []);
          setPaidAmount(initialData.paid || 0);
       } else {
          setBookingInfo({
            search: '', name: '', phone: '', agentTA: 'Chọn', agentCode: '',
            gender: 'Nữ', reservationCode: generateReservationCode(), pickup: '', dropoff: '',
            bank: 'Chọn', branch: 'Chi Nhánh'
          });
          setPricingRows(defaultPricingRows.map(r => ({...r})));
          setMembers([]);
          setPaidAmount(0);
       }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const totalQty = pricingRows.reduce((sum, r) => sum + Number(r.qty || 0), 0);
    setMembers(prev => {
      // If editing existing data and members are already filled, don't wipe them!
      if (initialData && prev.length > 0) {
          // Allow resizing array based on totalQty but preserve existing entries
          const newMembers = [...prev];
          if (newMembers.length < totalQty) {
              const diff = totalQty - newMembers.length;
              for (let i = 0; i < diff; i++) {
                 newMembers.push({ id: Date.now() + i, docType: 'CMTND' });
              }
          } else if (newMembers.length > totalQty) {
              newMembers.length = totalQty;
          }
          return newMembers;
      }
      
      // If no members, don't bootstrap unless qty > 0.
      if (totalQty === 0) return prev;
      
      const newMembers = [...prev];
      if (totalQty > newMembers.length) {
        // Need to add empty slots
        for (let i = newMembers.length; i < totalQty; i++) {
          newMembers.push({
            id: Date.now() + i,
            phone: '', name: '', ageType: 'Chưa rõ', gender: 'Chọn',
            dob: '', docType: 'CMTND', docId: '', issueDate: '', expiryDate: '',
            flightOut: '', flightIn: '', visaStatus: '-Chọn-', visaSubmit: '', visaResult: '',
            note: '', roomType: '-Chọn-', hotel: '', roomCode: ''
          });
        }
      } else if (totalQty < newMembers.length) {
        // Need to truncate
        return newMembers.slice(0, totalQty);
      }
      return newMembers;
    });
  }, [pricingRows]);

  const formatCurrency = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(val.toString().replace(/[^0-9]/g, ''));
    return isNaN(num) ? '' : num.toLocaleString('vi-VN');
  };

  const parseCurrency = (val) => {
    return Number(val.toString().replace(/[^0-9]/g, '') || 0);
  };

  const handlePricingChange = (id, field, value) => {
    setPricingRows(prev => prev.map(row => {
      if (row.id === id) {
        let numericValue = value;
        if (['price', 'surcharge', 'discount', 'comPerPax'].includes(field)) {
          numericValue = parseCurrency(value);
        } else if (field === 'qty') {
          numericValue = parseInt(value) || 0;
        }

        const updated = { ...row, [field]: numericValue };
        
        if (field === 'qty' || field === 'comPerPax') {
          updated.comCTV = Number(updated.qty || 0) * Number(updated.comPerPax || 0);
        }
        if (['price', 'qty', 'surcharge', 'discount'].includes(field)) {
          const svcTotal = (updated.extraServices || []).reduce((sum, s) => sum + s.total, 0);
          updated.total = (Number(updated.price || 0) * Number(updated.qty || 0)) + Number(updated.surcharge || 0) - Number(updated.discount || 0) + svcTotal;
        }
        return updated;
      }
      return row;
    }));
  };

  const clonePricingRow = (id) => {
    const rowToClone = pricingRows.find(r => r.id === id);
    if (!rowToClone) return;
    const newRow = { 
      ...rowToClone, 
      id: Date.now(), 
      qty: 0, 
      total: 0, 
      surcharge: 0, 
      discount: 0, 
      comCTV: 0,
      internalNote: '', 
      customerNote: '',
      extraServices: []
    };
    setPricingRows(prev => {
       const idx = prev.findIndex(r => r.id === id);
       const nextRows = [...prev];
       nextRows.splice(idx + 1, 0, newRow);
       return nextRows;
    });
  };

  const removePricingRow = (id) => {
    setPricingRows(prev => prev.filter(r => r.id !== id));
  };

  const addRowExtraService = (rowId) => {
    setPricingRows(prev => prev.map(r => {
      if (r.id === rowId) {
         const newSvcs = [...(r.extraServices || []), { id: Date.now(), name: '', price: 0, qty: 1, total: 0 }];
         return { ...r, extraServices: newSvcs };
      }
      return r;
    }));
  };

  const handleRowExtraServiceChange = (rowId, svcId, field, value) => {
    setPricingRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const newSvcs = (r.extraServices || []).map(svc => {
         if (svc.id === svcId) {
             let numVal = value;
             if (['price', 'qty'].includes(field)) {
               numVal = field === 'price' ? parseCurrency(value) : (parseInt(value) || 0);
               return { ...svc, [field]: numVal, total: (field === 'price' ? numVal : svc.price) * (field === 'qty' ? numVal : svc.qty) };
             }
             return { ...svc, [field]: value };
         }
         return svc;
      });
      const svcTotal = newSvcs.reduce((sum, s) => sum + s.total, 0);
      const newTotal = (Number(r.price || 0) * Number(r.qty || 0)) + Number(r.surcharge || 0) - Number(r.discount || 0) + svcTotal;
      return { ...r, extraServices: newSvcs, total: newTotal };
    }));
  };

  const removeRowExtraService = (rowId, svcId) => {
    setPricingRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const newSvcs = (r.extraServices || []).filter(s => s.id !== svcId);
      const svcTotal = newSvcs.reduce((sum, s) => sum + s.total, 0);
      const newTotal = (Number(r.price || 0) * Number(r.qty || 0)) + Number(r.surcharge || 0) - Number(r.discount || 0) + svcTotal;
      return { ...r, extraServices: newSvcs, total: newTotal };
    }));
  };

  useEffect(() => {
    // Generate required ageTypes array based on pricingRows
    const requiredAgeTypes = [];
    pricingRows.forEach(row => {
      const q = Number(row.qty || 0);
      for (let i = 0; i < q; i++) {
        requiredAgeTypes.push(row.ageType);
      }
    });
    
    const totalQty = requiredAgeTypes.length;

    setMembers(prev => {
      if (totalQty === 0) return [];
      
      const newMembers = [...prev];
      
      for (let i = 0; i < totalQty; i++) {
        if (newMembers[i]) {
          newMembers[i].ageType = requiredAgeTypes[i];
        } else {
          newMembers.push({
            id: Date.now() + i,
            phone: '', name: '', ageType: requiredAgeTypes[i], gender: 'Chọn',
            dob: '', docType: 'CMTND', docId: '', issueDate: '', expiryDate: '',
            flightOut: '', flightIn: '', visaStatus: '-Chọn-', visaSubmit: '', visaResult: '',
            note: '', roomType: '-Chọn-', hotel: '', roomCode: ''
          });
        }
      }
      
      if (totalQty < newMembers.length) {
        return newMembers.slice(0, totalQty);
      }
      return newMembers;
    });
  }, [pricingRows]);

  const addMember = () => {
    setMembers(prev => [...prev, {
      id: Date.now(),
      phone: '', name: '', ageType: 'Người lớn', gender: 'Chọn',
      dob: '', docType: 'CMTND', docId: '', issueDate: '', expiryDate: '',
      flightOut: '', flightIn: '', visaStatus: '-Chọn-', visaSubmit: '', visaResult: '',
      note: '', roomType: '-Chọn-', hotel: '', roomCode: ''
    }]);
  };

  const handleMemberChange = (id, field, value) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = () => {
    if (!bookingInfo.customerId) {
        alert("⚠️ BẮT BUỘC: Vui lòng tìm kiếm Khách hàng từ thanh [Tìm kiếm khách hàng]. Nếu chưa có, hãy nhấn dấu [+] để Tạo mới!");
        return;
    }
    
    // Tóm tắt dữ liệu thành 1 cục Khách hàng (Row) để đẩy ra bảng ngoài
    const totalQty = pricingRows.reduce((sum, r) => sum + Number(r.qty), 0);
    
    // Soft validation: Nhắc nhở nếu thiếu tên thành viên
    if (members.length > 0) {
        const hasInvalidMembers = members.some(m => !m.name || m.name.trim() === '');
        if (hasInvalidMembers) {
            const confirmFill = window.confirm(`⚠️ Bạn đang để trống TÊN của một số thành viên trong nhóm (${totalQty} người).\n\nHệ thống sẽ tạm điền là "Khách...". Bạn có thể bổ sung danh sách sau khi chốt xong.\n\nTiếp tục lưu Booking này?`);
            if (!confirmFill) return; // Dừng lại nếu Sale muốn nhập ngay
            
            // Auto-fill các tên trống
            members.forEach((m, idx) => {
                if (!m.name || m.name.trim() === '') {
                    m.name = `Khách ${idx + 1} (Của ${bookingInfo.name || 'Group'})`;
                }
            });
        }
    }

    const totalSurcharge = pricingRows.reduce((sum, r) => sum + Number(r.surcharge), 0);
    const totalDiscount = pricingRows.reduce((sum, r) => sum + Number(r.discount), 0);

    const customerData = {
      id: initialData?.id, // ID is preserved if editing
      customer_id: bookingInfo.customerId || initialData?.customer_id,
      name: bookingInfo.name || 'Khách Vãng Lai',
      phone: members[0]?.phone || bookingInfo.phone || '',
      cmnd: members[0]?.docId || '',
      qty: totalQty,
      base_price: totalPrice - totalSurcharge + totalDiscount,
      surcharge: totalSurcharge,
      discount: totalDiscount,
      total: totalPrice,
      paid: paidAmount || 0,
      status: (paidAmount > 0 && paidAmount < totalPrice) ? 'Đã đặt cọc' : (paidAmount >= totalPrice && totalPrice > 0 ? 'Đã thanh toán' : (initialData?.status || 'Giữ chỗ')),
      raw_details: { bookingInfo, pricingRows, members } // Lưu tất cả data gốc dưới dạng JSONB
    };

    onSave(customerData);
  };

  if (!isOpen) return null;

  const totalPrice = pricingRows.reduce((sum, r) => sum + Number(r.total || 0), 0);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '95%', maxWidth: '1400px', height: '90%', background: '#fff', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, textAlign: 'center', flex: 1, fontSize: '18px', fontWeight: 'bold' }}>THÊM BOOKING (GIỮ CHỖ)</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>#1 Thông tin chung</h4>
          
          {/* Form row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(200px, 1fr) 100px 150px', gap: '15px', alignItems: 'flex-end', marginBottom: '30px' }}>
             <div style={{ position: 'relative', zIndex: 10 }}>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Tìm kiếm khách hàng*: <span style={{color:'red'}}>(*)</span></label>
                
                <AsyncSelect
                   cacheOptions
                   loadOptions={loadCustomerOptions}
                   defaultOptions={false}
                   placeholder="Tìm khách hàng (Tên hoặc SĐT)..."
                   onChange={(selectedOption) => {
                      if (selectedOption) selectCustomer(selectedOption.customer);
                   }}
                   styles={{
                      control: (base) => ({
                         ...base,
                         minHeight: '38px',
                         border: '1px solid #cbd5e1',
                         boxShadow: 'none',
                         '&:hover': { border: '1px solid #94a3b8' }
                      })
                   }}
                />
             </div>
             <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Tên Booker*: <span style={{color:'red'}}>(*)</span></label>
                <input type="text" value={bookingInfo.name} onChange={e => setBookingInfo({...bookingInfo, name: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
             </div>
             <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Giới tính:</label>
                <select value={bookingInfo.gender} onChange={e => setBookingInfo({...bookingInfo, gender: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                   <option>Nữ</option>
                   <option>Nam</option>
                </select>
             </div>
             <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Mã giữ chỗ:</label>
                <input type="text" value={bookingInfo.reservationCode} onChange={e => setBookingInfo({...bookingInfo, reservationCode: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc' }} />
             </div>
          </div>

          {/* PRICING ROWS */}
          <h4 style={{ margin: '30px 0 15px 0', fontSize: '16px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>#2 Thông tin giá & Báo giá</h4>
          {pricingRows.map((row, idx) => (
             <React.Fragment key={row.id}>
             <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', overflowX: 'auto', paddingBottom: '10px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                     <button onClick={() => clonePricingRow(row.id)} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', width: '35px', height: '35px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Thêm dòng giá vé tương tự"><Plus size={16} /></button>
                     {row.id > 10 && (
                        <button onClick={() => removePricingRow(row.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '35px', height: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Xoá vé này"><X size={14} /></button>
                     )}
                   </div>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Độ tuổi:</label>
                     <select value={row.ageType} readOnly style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                        <option>{row.ageType}</option>
                     </select>
                  </div>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Giá Tiền:</label>
                     <input type="text" value={formatCurrency(row.price)} onChange={e => handlePricingChange(row.id, 'price', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '60px', flexShrink: 0 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Số lượng :</label>
                     <input type="number" value={row.qty} onChange={e => handlePricingChange(row.id, 'qty', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '100px', flexShrink: 0 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Phụ thu :</label>
                     <input type="text" value={formatCurrency(row.surcharge)} onChange={e => handlePricingChange(row.id, 'surcharge', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '100px', flexShrink: 0 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Giảm giá :</label>
                     <input type="text" value={formatCurrency(row.discount)} onChange={e => handlePricingChange(row.id, 'discount', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>

                  <div style={{ width: '140px', flexShrink: 0 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Tổng thu:</label>
                     <input type="text" value={formatCurrency(row.total)} readOnly style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', fontWeight: 'bold' }} />
                  </div>
               </div>

               {/* Notes fields for each row */}
               <div style={{ display: 'flex', gap: '20px', paddingLeft: '45px', marginTop: '10px' }}>
                  <div style={{ flex: 1 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Ghi chú nội bộ:</label>
                     <textarea style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', height: '40px' }}></textarea>
                  </div>
                  <div style={{ flex: 1 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Ghi chú khách hàng:</label>
                     <textarea style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', height: '40px' }}></textarea>
                  </div>
               </div>
               <div style={{ paddingLeft: '45px', marginTop: '15px' }}>
                  <span onClick={() => addRowExtraService(row.id)} style={{ color: '#0ea5e9', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm dịch vụ mới</span>
               </div>
               
               {/* INNER DỊCH VỤ KÈM THEO TABLE */}
               {row.extraServices && row.extraServices.length > 0 && (
                   <div style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', marginLeft: '45px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                         <h4 style={{ margin: 0, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DỊCH VỤ KÈM THEO (CỘNG VÀO TỔNG THU CỦA ĐỘ TUỔI NÀY)</h4>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px 150px 40px', gap: '15px', marginBottom: '10px', fontWeight: 'bold', fontSize: '11px', color: '#64748b' }}>
                         <div>DỊCH VỤ</div>
                         <div>ĐƠN GIÁ (VND)</div>
                         <div>SỐ LƯỢNG</div>
                         <div>THÀNH TIỀN</div>
                         <div></div>
                      </div>
                      {row.extraServices.map((svc) => (
                        <div key={svc.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px 150px 40px', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                           <input type="text" value={svc.name} placeholder="Nhập tên dịch vụ..." onChange={e => handleRowExtraServiceChange(row.id, svc.id, 'name', e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'bold' }} />
                           <input type="text" value={formatCurrency(svc.price)} onChange={e => handleRowExtraServiceChange(row.id, svc.id, 'price', e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right' }} />
                           <input type="number" value={svc.qty} onChange={e => handleRowExtraServiceChange(row.id, svc.id, 'qty', e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} />
                           <input type="text" value={formatCurrency(svc.total)} readOnly style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f1f5f9', fontWeight: 'bold', color: '#f59e0b', textAlign: 'right' }} />
                           <button onClick={() => removeRowExtraService(row.id, svc.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', height: '34px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><X size={16} /></button>
                        </div>
                      ))}
                      <div style={{ marginTop: '10px' }}>
                         <button onClick={() => addRowExtraService(row.id)} style={{ background: '#f1f5f9', border: '1px dashed #3b82f6', color: '#3b82f6', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Plus size={12} /> Thêm dịch vụ mới
                         </button>
                      </div>
                   </div>
               )}
             </div>
             </React.Fragment>
          ))}

          {/* DANH SÁCH THÀNH VIÊN */}
          <div style={{ marginTop: '30px', borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>#3 Danh sách thành viên (Tuỳ chọn)</h4>
                <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                   <Plus size={12} /> Import
                </button>
             </div>
             
             {members.map((m, idx) => (
               <div key={m.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ef4444', paddingBottom: '8px', paddingRight: '5px' }}>#{idx + 1}</div>
                  <button style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', flexShrink: 0 }}>+</button>
                  <button style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '4px', width: '30px', height: '30px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📷</button>
                  
                  <div style={{ width: '110px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Điện thoại:</label>
                     <input type="text" value={m.phone} onChange={e => handleMemberChange(m.id, 'phone', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '130px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Tên:</label>
                     <input type="text" value={m.name} onChange={e => handleMemberChange(m.id, 'name', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '110px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Độ tuổi:</label>
                     <select value={m.ageType} onChange={e => handleMemberChange(m.id, 'ageType', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                        <option>Người lớn</option>
                        <option>Trẻ em (6 - 11)</option>
                        <option>Trẻ em (2 - 5)</option>
                        <option>Trẻ nhỏ</option>
                        <option>Chưa rõ</option>
                     </select>
                  </div>
                  <div style={{ width: '70px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Giới tính:</label>
                     <select value={m.gender} onChange={e => handleMemberChange(m.id, 'gender', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                        <option>Chọn</option><option>Nữ</option><option>Nam</option>
                     </select>
                  </div>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Ngày sinh:</label>
                     <input type="date" value={m.dob} onChange={e => handleMemberChange(m.id, 'dob', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '100px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>CMT/Hộ chiếu:</label>
                     <select value={m.docType} onChange={e => handleMemberChange(m.id, 'docType', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                        <option>CMTND</option>
                        <option>CCCD</option>
                        <option>Hộ chiếu</option>
                     </select>
                  </div>
                  <div style={{ width: '110px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>ID:</label>
                     <input type="text" value={m.docId} onChange={e => handleMemberChange(m.id, 'docId', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>

                  <div style={{ width: '120px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Ngày cấp:</label>
                     <input type="date" value={m.issueDate} onChange={e => handleMemberChange(m.id, 'issueDate', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Ngày hết hạn:</label>
                     <input type="date" value={m.expiryDate} onChange={e => handleMemberChange(m.id, 'expiryDate', e.target.value)} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>

                  {/* Additional fields hidden in the horizontal scroll... */}
                  <div style={{ width: '60px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Vé đi:</label>
                     <input type="text" style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '60px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Vé về:</label>
                     <input type="text" style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '100px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Tình trạng Visa:</label>
                     <select style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}><option>-Chọn-</option></select>
                  </div>
                  <div style={{ width: '60px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Nộp Visa:</label>
                     <input type="text" style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '60px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>KQ Visa:</label>
                     <input type="text" style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '80px', flexShrink: 0 }}>
                     <label style={{ fontSize: '10px' }}>Ghi chú:</label>
                     <input type="text" style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
               </div>
             ))}
          </div>

          <div style={{ background: '#f8fafc', padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
             <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                   <div style={{ fontSize: '11px', color: '#64748b' }}>Tổng Tiền</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>{totalPrice.toLocaleString('vi-VN')}</div>
                </div>
                <div>
                   <div style={{ fontSize: '11px', color: '#64748b' }}>Đã thu (Cọc)</div>
                   <div style={{ position: 'relative' }}>
                      <input type="text" value={formatCurrency(paidAmount)} onChange={e => setPaidAmount(parseCurrency(e.target.value))} style={{ padding: '4px 8px', width: '120px', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'bold', color: '#10b981' }} />
                   </div>
                </div>
                <div>
                   <div style={{ fontSize: '11px', color: '#64748b' }}>Còn thiếu</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>{(totalPrice - paidAmount).toLocaleString('vi-VN')}</div>
                </div>
             </div>
             
             <div>
                <button onClick={handleSubmit} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                   Lưu / Thêm vào tour
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
