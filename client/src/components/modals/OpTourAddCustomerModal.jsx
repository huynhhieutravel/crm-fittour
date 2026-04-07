import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Plus } from 'lucide-react';

export default function OpTourAddCustomerModal({ isOpen, onClose, onSave, initialData }) {
  const [bookingInfo, setBookingInfo] = useState({
    search: '',
    name: '',
    phone: '',
    agentTA: 'Chọn',
    agentCode: '',
    gender: 'Nữ',
    reservationCode: 'ECWSQD',
    pickup: '',
    dropoff: '',
    bank: 'Chọn',
    branch: 'Chi Nhánh'
  });

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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
      setCustomers(prev => [newCust, ...prev]);
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

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        const rawData = res.data?.data || res.data;
        const finalArray = Array.isArray(rawData) ? rawData : [];
        console.log('Fetched customers array length:', finalArray.length);
        setCustomers(finalArray);
      })
      .catch(err => console.error('Error fetching customers', err));
    }
  }, [isOpen]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setBookingInfo({ ...bookingInfo, search: val, customerId: null });

    console.log('Searching for:', val, 'in customers count:', customers.length);

    if (val.trim().length > 1) {
      const lowerVal = val.toLowerCase();
      const filtered = customers.filter(c => {
        const nameMatch = c.name && String(c.name).toLowerCase().includes(lowerVal);
        const phoneMatch = c.phone && String(c.phone).includes(val);
        return nameMatch || phoneMatch;
      });
      console.log('Filtered total:', filtered.length);
      setFilteredCustomers(filtered);
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
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

  const [pricingRows, setPricingRows] = useState([
    { id: 1, ageType: 'Người lớn', name: '', price: 25490000, qty: 1, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 25490000, internalNote: '', customerNote: '' },
    { id: 2, ageType: 'Trẻ em (6 - 11)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
    { id: 3, ageType: 'Trẻ em (2 - 5)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
    { id: 4, ageType: 'Trẻ nhỏ', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
  ]);

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
            gender: 'Nữ', reservationCode: 'ECWSQD', pickup: '', dropoff: '',
            bank: 'Chọn', branch: 'Chi Nhánh'
          });
          setPricingRows(raw.pricingRows || [
            { id: 1, ageType: 'Người lớn', name: '', price: initialData.base_price || 25490000, qty: initialData.qty || 1, surcharge: initialData.surcharge || 0, discount: initialData.discount || 0, comPerPax: 0, comCTV: 0, total: initialData.total || 25490000, internalNote: '', customerNote: '' },
            { id: 2, ageType: 'Trẻ em (6 - 11)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
            { id: 3, ageType: 'Trẻ em (2 - 5)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
            { id: 4, ageType: 'Trẻ nhỏ', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
          ]);
          setMembers(raw.members || []);
          setPaidAmount(initialData.paid || 0);
       } else {
          setBookingInfo({
            search: '', name: '', phone: '', agentTA: 'Chọn', agentCode: '',
            gender: 'Nữ', reservationCode: 'ECWSQD', pickup: '', dropoff: '',
            bank: 'Chọn', branch: 'Chi Nhánh'
          });
          setPricingRows([
            { id: 1, ageType: 'Người lớn', name: '', price: 25490000, qty: 1, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 25490000, internalNote: '', customerNote: '' },
            { id: 2, ageType: 'Trẻ em (6 - 11)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
            { id: 3, ageType: 'Trẻ em (2 - 5)', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
            { id: 4, ageType: 'Trẻ nhỏ', name: '', price: 0, qty: 0, surcharge: 0, discount: 0, comPerPax: 0, comCTV: 0, total: 0, internalNote: '', customerNote: '' },
          ]);
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
          updated.total = (Number(updated.price || 0) * Number(updated.qty || 0)) + Number(updated.surcharge || 0) - Number(updated.discount || 0);
        }
        return updated;
      }
      return row;
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
    
    // Ràng buộc số lượng thành viên phải có tên
    if (members.length > 0) {
        const hasInvalidMembers = members.some(m => !m.name || m.name.trim() === '');
        if (hasInvalidMembers) {
            alert(`⚠️ Vui lòng nhập đầy đủ HỌ VÀ TÊN cho tất cả ${totalQty} người ở Danh sách Thành viên bên dưới!`);
            return;
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
    onClose();
  };

  if (!isOpen) return null;

  const totalPrice = pricingRows.reduce((sum, r) => sum + Number(r.total), 0);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '95%', maxWidth: '1400px', height: '90%', background: '#fff', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, textAlign: 'center', flex: 1, fontSize: '18px', fontWeight: 'bold' }}>THÊM KHÁCH HÀNG</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          
          <h4 style={{ margin: '0 0 15px 0', fontSize: '15px' }}>#1 Thông tin khách hàng</h4>
          
          {/* Form row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(200px, 1fr) 100px 150px', gap: '15px', alignItems: 'flex-end', marginBottom: '30px' }}>
             <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Tìm kiếm khách hàng*: <span style={{color:'red'}}>(*)</span></label>
                
                {isQuickAdd ? (
                   <div style={{ display: 'flex', gap: '5px' }}>
                     <input type="text" placeholder="Tên khách hàng" value={quickAddName} onChange={e => setQuickAddName(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', maxWidth: '100px' }} />
                     <input type="text" placeholder="Số ĐT" value={quickAddPhone} onChange={e => setQuickAddPhone(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', maxWidth: '80px' }} />
                     <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleCreateQuickCustomer} title="Lưu Khách & Chọn">Lưu</button>
                     <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setIsQuickAdd(false)}><X size={16} /></button>
                   </div>
                ) : (
                   <div style={{ display: 'flex', gap: '5px' }}>
                     <input type="text" value={bookingInfo.search || ''} onChange={handleSearchChange} onFocus={() => (bookingInfo.search || '').trim().length > 1 && setShowSearchDropdown(true)} placeholder="Nhập Tên, SĐT để tìm kiếm" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                     <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', height: '35px' }} onClick={() => setShowSearchDropdown(true)}>
                        <Search size={16} />
                     </button>
                     <button style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', height: '35px' }} onClick={() => setIsQuickAdd(true)} title="Tạo Khách hàng mới nhanh">
                        <Plus size={16} strokeWidth={3} />
                     </button>
                   </div>
                )}
                
                {showSearchDropdown && !isQuickAdd && filteredCustomers.length > 0 && (
                   <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', maxHeight: '250px', overflowY: 'auto', zIndex: 100, listStyle: 'none', padding: 0, margin: '2px 0 0 0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                      {filteredCustomers.map(c => (
                         <li key={c.id} onClick={() => selectCustomer(c)} style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '13px' }} onMouseOver={e => e.currentTarget.style.background='#f0fdf4'} onMouseOut={e => e.currentTarget.style.background='white'}>
                            <div style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{c.name}</div>
                            <div style={{ color: '#64748b', fontSize: '11px' }}>{c.phone} {c.email ? `- ${c.email}` : ''}</div>
                         </li>
                      ))}
                   </ul>
                )}
                {showSearchDropdown && (bookingInfo.search || '').trim().length > 1 && filteredCustomers.length === 0 && (
                   <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '10px', fontSize: '12px', color: '#ef4444', zIndex: 100, margin: '2px 0 0 0' }}>
                      Không tìm thấy khách hàng.
                   </div>
                )}
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
          {pricingRows.map((row, idx) => (
            <div key={row.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #e2e8f0' }}>
               <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', overflowX: 'auto', paddingBottom: '10px' }}>
                  <button style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', width: '35px', height: '35px', cursor: 'pointer', flexShrink: 0 }}>+</button>
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
                  <div style={{ width: '120px', flexShrink: 0 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Hoa hồng/Người</label>
                     <input type="text" value={formatCurrency(row.comPerPax)} onChange={e => handlePricingChange(row.id, 'comPerPax', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                     <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Hoa hồng CTV</label>
                     <input type="text" value={formatCurrency(row.comCTV)} readOnly style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }} />
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
               <div style={{ paddingLeft: '45px', marginTop: '5px' }}>
                  <span style={{ color: '#0ea5e9', fontSize: '12px', cursor: 'pointer' }}>+ Phụ thu phát sinh</span>
               </div>
            </div>
          ))}

          {/* DANH SÁCH THÀNH VIÊN */}
          <div style={{ marginTop: '30px', borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: '#f59e0b', fontSize: '14px' }}>Danh sách thành viên (Nếu có)</h4>
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

             <button onClick={addMember} style={{ background: '#f1f5f9', border: '1px dashed #cbd5e1', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
                <Plus size={14} /> Thêm thành viên
             </button>
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
