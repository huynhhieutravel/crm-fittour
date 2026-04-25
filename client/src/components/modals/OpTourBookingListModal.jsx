import React, { useState } from 'react';
import { X, Trash2, Edit2, CheckCircle, Mail, DollarSign, RefreshCw, FileText, UserPlus, Users, Download, ArrowRight, AlertTriangle } from 'lucide-react';
import Select from 'react-select';
import axios from 'axios';
import * as XLSX from 'xlsx-js-style';
import BookingVouchersModal from './BookingVouchersModal';

export default function OpTourBookingListModal({ isOpen, onClose, tour, onOpenAddCustomer, onEditBooking, onUpdateTour, onRefreshList, currentUser, refreshTrigger }) {
  const [hoveredQty, setHoveredQty] = useState({ id: null, rows: [], x: 0, y: 0 });
  const [viewingMembers, setViewingMembers] = useState(null); // { booking, members }
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(null);
  const [showVouchersModal, setShowVouchersModal] = useState(null);
  const [transferTourId, setTransferTourId] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [activeTours, setActiveTours] = useState([]);
  const [confirmTransferModal, setConfirmTransferModal] = useState(false);

  const executeTransfer = async () => {
    setIsTransferring(true);
    try {
      await axios.put(`/api/op-tours/${tour.id}/bookings/${showTransferModal?.id}/transfer`, { targetTourId: transferTourId }, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConfirmTransferModal(false);
      setShowTransferModal(null);
      setBookings(prev => prev.filter(bk => bk.id !== showTransferModal?.id));
      
      if (onUpdateTour) {
         const newTourRes = await axios.get(`/api/op-tours/${tour.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
         onUpdateTour(newTourRes.data);
         if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      console.error('Transfer Error:', err);
      const errorMsg = err.response?.data?.error || err.message || "Lỗi không xác định khi chuyển Tour";
      alert("LỖI: " + errorMsg);
    } finally {
      setIsTransferring(false);
    }
  };

  React.useEffect(() => {
    if (showTransferModal) {
       axios.get('/api/op-tours', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
         .then(res => {
            const list = res.data?.data || res.data || [];
            setActiveTours(list.filter(t => t.status !== 'Hủy' && t.status !== 'Huỷ' && t.id !== tour.id));
         })
         .catch(err => console.error("Lỗi lấy danh sách tour", err));
    }
  }, [showTransferModal]);
  React.useEffect(() => {
     if (isOpen && tour?.id) {
        setLoadingBookings(true);
        axios.get(`/api/op-tours/${tour.id}/bookings`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
           setBookings(res.data || []);
           setLoadingBookings(false);
        }).catch(err => {
           console.error("Lỗi lấy bookings", err);
           setLoadingBookings(false);
        });
     }
  }, [isOpen, tour?.id, refreshTrigger]);

  if (!isOpen) return null;

  const isOwnerOrAdmin = (b) => {
      // If admin, manager, điều hành (operator)
      if (currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'group_manager' || currentUser?.role === 'operator' || String(currentUser?.role || '').includes('operations')) return true;
      // If sales owner
      if (b?.created_by == currentUser?.id || b?.created_by_name === currentUser?.username) return true;
      return false;
  };

  const exportMembersXlsx = (members, bookingName, bookingNote = '') => {
    let countNL = 0, countTE = 0, countTN = 0;
    members.forEach(m => {
      if (m.ageType?.includes('Người lớn')) countNL++;
      else if (m.ageType?.includes('Trẻ em')) countTE++;
      else if (m.ageType?.includes('Trẻ nhỏ') || m.ageType?.includes('Em bé')) countTN++;
    });

    const departDate = tour?.start_date ? new Date(tour.start_date).toLocaleDateString('vi-VN') : '';
    const closingDate = tour?.end_date ? new Date(tour.end_date).toLocaleDateString('vi-VN') : '';

    const pickupPoint = tour?.tour_info?.pickup_point || '';
    const dropoffPoint = tour?.tour_info?.dropoff_point || '';
    const operators = tour?.tour_info?.operators || '';
    
    let flightItinerary = tour?.tour_info?.flight_itinerary || '';
    if (!flightItinerary && (tour?.tour_info?.departure_flight || tour?.tour_info?.return_flight)) {
       flightItinerary = `${tour.tour_info?.dep_airline || ''} ${tour.tour_info?.departure_flight || ''}`.trim() + (tour.tour_info?.return_flight ? ` - ${tour.tour_info?.ret_airline || ''} ${tour.tour_info?.return_flight || ''}`.trim() : '');
    }

    const wsData = [];
    wsData.push(['', 'DANH SÁCH KHÁCH HÀNG ĐĂNG KÝ TOUR', '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', `MÃ TOUR: ${tour?.tour_code || ''}`, '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', `BOOKING: ${bookingName || ''}`, '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', 'Ngày khởi hành :', departDate, '', 'Điểm đón :', pickupPoint, '', '', '', '', '', 'GHI CHÚ ĐẶC BIỆT CHO TOUR', '']);
    wsData.push(['', 'Ngày kết thúc :', closingDate, '', 'Điểm trả :', dropoffPoint, '', '', '', '', '', '{ GHI CHÚ }', '']);
    wsData.push(['', `Số lượng NL :`, countNL, '', 'Nhân viên điều hành :', operators, '', '', '', '', '', '', '']);
    wsData.push(['', `Số lượng TE :`, countTE, '', 'Hành trình bay :', flightItinerary, '', '', '', '', '', '', '']);
    wsData.push(['', `Số lượng TN :`, countTN, '', '', '', '', '', '', '', '', '', '']);
    wsData.push([]); 

    const headerRow = [
      'STT',
      'HỌ VÀ TÊN',
      'DOB',
      'GIỚI TÍNH',
      'ĐỘ TUỔI',
      'SỐ HỘ CHIẾU',
      'NGÀY CẤP',
      'NGÀY HẾT HẠN',
      'SỐ ĐIỆN THOẠI',
      'MÃ PHÒNG',
      'GHI CHÚ'
    ];
    wsData.push(headerRow);

    members.forEach((m, i) => {
      const formatName = (str) => {
          if (!str) return '';
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
      };
      
      wsData.push([
        i + 1, formatName(m.name), m.dob || '', m.gender || '', m.ageType || '',
        m.docId || '', m.issueDate || '', m.expiryDate || '',
        m.phone || '', m.roomCode || '', 
        (i === 0 && bookingNote) ? (bookingNote + (m.note ? ` - ${m.note}` : '')) : (m.note || '')
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const borderAll = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    const centerAlign = { vertical: "center", horizontal: "center", wrapText: true };
    const leftAlign = { vertical: "center", horizontal: "left", wrapText: true };

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
        const cell = ws[cellRef];
        cell.s = { ...cell.s, font: { name: "Times New Roman", sz: 11 } };

        if (R >= 0 && R <= 2) { cell.s.font.bold = true; cell.s.font.sz = R === 0 ? 14 : 12; cell.s.alignment = centerAlign; }
        if (R >= 3 && R <= 7) {
          cell.s.font.bold = (C === 1 || C === 4);
          cell.s.alignment = { vertical: "center", horizontal: C === 1 || C === 4 ? "right" : "left" };
          if (R === 3 && C >= 11) { cell.s.font.color = { rgb: "FF0000" }; cell.s.font.bold = true; }
        }
        if (R === 9) { 
          cell.s.font.bold = true; 
          cell.s.font.color = { rgb: "FFFFFF" };
          cell.s.alignment = centerAlign; 
          cell.s.border = borderAll; 
          cell.s.fill = { fgColor: { rgb: "1D4ED8" } };
        }
        if (R >= 10) {
          cell.s.border = borderAll; cell.s.alignment = centerAlign;
          if (R % 2 !== 0 && R > 9) { 
            cell.s.fill = { fgColor: { rgb: "F8FAFC" } }; 
          }
          if (C === 1 || C === 11) cell.s.alignment = leftAlign;
        }
      }
    }

    ws['!cols'] = [
      { wch: 6 }, { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 14 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 14 }, { wch: 12 }, { wch: 25 }
    ];

    ws['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 10 } },
      { s: { r: 2, c: 1 }, e: { r: 2, c: 10 } },
      { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } }, { s: { r: 3, c: 5 }, e: { r: 3, c: 9 } }, { s: { r: 3, c: 11 }, e: { r: 3, c: 12 } },
      { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } }, { s: { r: 4, c: 5 }, e: { r: 4, c: 9 } }, { s: { r: 4, c: 11 }, e: { r: 4, c: 12 } },
      { s: { r: 5, c: 2 }, e: { r: 5, c: 3 } }, { s: { r: 5, c: 5 }, e: { r: 5, c: 9 } },
      { s: { r: 6, c: 2 }, e: { r: 6, c: 3 } }, { s: { r: 6, c: 5 }, e: { r: 6, c: 9 } },
      { s: { r: 7, c: 2 }, e: { r: 7, c: 3 } }
    ];

    ws['!rows'] = [];
    for (let i = 0; i < 9; i++) ws['!rows'].push({ hpx: 22 });
    ws['!rows'].push({ hpx: 30 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khách');
    const safeTourName = (tour?.tour_code || 'Tour').replace(/[\s\/\\]+/g, '_');
    const safeBooking = (bookingName || 'Khach').replace(/[\s\/\\]+/g, '_');
    XLSX.writeFile(wb, `DanhSach_${safeTourName}_${safeBooking}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportChinaTourXlsx = (members, bookingName, bookingNote = '') => {
    const wsData = [];
    
    // Row 1: Header
    wsData.push(['TRIP INFORMATION AND NAMELIST 行程信息和名单', '', '', '', '', '', '', '', '', '', '', '']);
    
    // Row 2: Tour Name
    wsData.push(['FIT TOUR', '', '', '', 'Tour 行程', '', 'TP.HCM - THƯỢNG HẢI (TQ)', '', '', '', '', '']);
    
    // Row 3: Banner & Operator
    wsData.push(['', '', '', '', 'Banner\n欢迎横幅', '', 'WELCOME FIT TOUR', '', 'Điều hành 计调', '', '', '']);
    
    // Row 4: Tour Leader
    wsData.push(['', '', '', '', 'Tour Leader\n旅游领队', '', '', '', 'HANI NGUYEN', '', '', '']);
    
    // Row 5: Flight Header
    wsData.push(['FLIGHT DETAIL\n航班详情', '', 'DATE\n日期', 'JOURNEY\n行程', 'FLIGHT NUMBER\n航班', 'DEPARTURE\n起飞 (时间)', 'ARRIVAL\n到达 (时间)', '', '', '', '', '']);
    
    // Row 6: Flight From
    wsData.push(['From HAN\n胡志明市', '', 'TH26MAR', 'SGN WUH', 'CZ8318', '0240', '0730', '7KG HLXT+\n23KG HLKG', '', '', '', '']);
    
    // Row 7: Flight Return
    wsData.push(['Return 往回', '', 'WE01APR', 'WUH SGN', 'CZ8317', '2210', '0105+1', '', '', '', '', '']);
    
    // Row 8: Empty or space
    wsData.push([]);
    
    // Row 9: Passenger Header
    wsData.push([
      'STT', 
      'Surname\n性', 
      'Given name\n名', 
      'Gender\n性别', 
      'DOB 生日\n(yyyymmdd)', 
      'Passport no\n护照号', 
      'DOE 到期日期\n(yyyy/mm/dd)', 
      'Nationality\n国籍', 
      'Rooming\n分房', 
      'SĐT\n手机号码', 
      'NOTE\n备注',
      'PASSPORT LINK\n护照链接'
    ]);

    const formatToYYYYMMDD = (dateStr) => {
       if (!dateStr) return '';
       const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.includes('-') ? dateStr.split('-') : [];
       if (parts.length === 3) {
          if (parts[2].length === 4) return `${parts[2]}${parts[1]}${parts[0]}`; // DD/MM/YYYY
          if (parts[0].length === 4) return `${parts[0]}${parts[1]}${parts[2]}`; // YYYY-MM-DD
       }
       return dateStr.replace(/[-/]/g, '');
    };

    const formatName = (str) => {
       if (!str) return '';
       return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
    };

    members.forEach((m, i) => {
      const fullName = formatName(m.name || '').trim();
      let surname = '';
      let givenName = '';
      if (fullName) {
        const parts = fullName.split(' ');
        if (parts.length > 1) {
          surname = parts[0];
          givenName = parts.slice(1).join(' ');
        } else {
          surname = fullName;
          givenName = '';
        }
      }

      const gender = m.gender === 'Nam' ? 'M' : m.gender === 'Nữ' ? 'F' : '';
      const dob = formatToYYYYMMDD(m.dob);
      const doe = formatToYYYYMMDD(m.expiryDate);
      const rooming = m.roomCode || '';
      const note = (i === 0 && bookingNote) ? (bookingNote + (m.note ? ` - ${m.note}` : '')) : (m.note || '');
      const fullPassportUrl = m.passportUrl ? (m.passportUrl.startsWith('/') ? `https://crm.tournuocngoai.com${m.passportUrl}` : m.passportUrl) : '';

      wsData.push([
        i + 1, 
        surname, 
        givenName, 
        gender, 
        dob, 
        m.docId || '', 
        doe, 
        'VNM', // Nationality Default
        rooming, 
        m.phone || '', 
        note,
        fullPassportUrl
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const borderAll = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    const centerAlign = { vertical: "center", horizontal: "center", wrapText: true };
    const orangeBg = { fgColor: { rgb: "ED7D31" } }; // Standard orange

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
        const cell = ws[cellRef];
        
        cell.s = { ...cell.s, font: { name: "Times New Roman", sz: 11 } };
        
        // Row 1 (Index 0) - Title
        if (R === 0) {
           cell.s.font.bold = true;
           cell.s.font.sz = 14;
           cell.s.alignment = centerAlign;
           cell.s.fill = orangeBg;
           cell.s.border = borderAll;
        }

        // Row 5 (Index 4) - Flight Header
        if (R === 4) {
           cell.s.font.bold = true;
           cell.s.alignment = centerAlign;
           cell.s.fill = orangeBg;
           cell.s.border = borderAll;
        }

        // Row 9 (Index 8) - Passenger Header
        if (R === 8) {
           cell.s.font.bold = true;
           cell.s.alignment = centerAlign;
           cell.s.fill = orangeBg;
           cell.s.border = borderAll;
        }

        // Apply borders for standard data grids
        if ((R >= 1 && R <= 6) || R >= 8) {
           cell.s.border = borderAll;
        }

        // Formatting text colors based on the hardcoded template
        // Surname column values red
        if (R > 8 && C === 1) {
           cell.s.font.color = { rgb: "FF0000" };
        }
        // Given name column values red
        if (R > 8 && C === 2) {
           cell.s.font.color = { rgb: "FF0000" };
           cell.s.font.bold = true;
        }
        // Tour Leader text red
        if (R === 3 && C === 8) {
           cell.s.font.color = { rgb: "FF0000" };
        }
        if ((R === 5 || R === 6) && (C === 2 || C === 3 || C === 4 || C === 5 || C === 6 || C === 7)) {
           cell.s.font.color = { rgb: "FF0000" }; // the flight info details red
           cell.s.font.bold = true;
           cell.s.alignment = centerAlign;
        }
        
        if (R >= 8) {
           cell.s.alignment = centerAlign;
        }

        // Highlight Passport Link column (Index 11) with RED text and make it a link
        if (R >= 8 && C === 11) {
           cell.s.font.color = { rgb: "FF0000" };
           if (cell.v && String(cell.v).startsWith('http')) {
               cell.s.font.underline = true;
               cell.l = { Target: cell.v, Tooltip: "Xem ảnh Passport" };
           }
        }
      }
    }

    ws['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
    ];

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // TRIP INFORMATION AND NAMELIST
      { s: { r: 1, c: 0 }, e: { r: 3, c: 3 } },  // FIT TOUR Logo
      { s: { r: 1, c: 4 }, e: { r: 1, c: 5 } },  // Tour 行程
      { s: { r: 1, c: 6 }, e: { r: 1, c: 11 } }, // TP.HCM - THƯỢNG HẢI
      { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } },  // Banner
      { s: { r: 2, c: 6 }, e: { r: 2, c: 7 } },  // WELCOME FIT TOUR
      { s: { r: 2, c: 8 }, e: { r: 2, c: 11 } }, // Điều hành
      { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } },  // Tour Leader
      { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } },  // Blank next to Tour Leader
      { s: { r: 3, c: 8 }, e: { r: 3, c: 11 } }, // HANI NGUYEN
      
      // Flight section merging
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },  // FLIGHT DETAIL
      { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } },  // From HAN
      { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } },  // Return 往回
      { s: { r: 4, c: 7 }, e: { r: 6, c: 11 } }, // Baggage
    ];

    ws['!rows'] = [
      { hpx: 30 }, { hpx: 25 }, { hpx: 25 }, { hpx: 25 }, { hpx: 35 }, { hpx: 35 }, { hpx: 35 }
    ];
    // Set heights for the Header row
    ws['!rows'][8] = { hpx: 35 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khách TQ');
    const safeTourName = (tour?.tour_code || 'Tour').replace(/[\s\/\\]+/g, '_');
    const safeBooking = (bookingName || 'Khach').replace(/[\s\/\\]+/g, '_');
    XLSX.writeFile(wb, `DS_TQ_${safeTourName}_${safeBooking}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
  // Calculate top cards stats
  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN');
  
  let countGiuCho = 0;
  let countDatCoc = 0;
  let countThanhToan = 0;
  let sumNguoiLon = 0;
  let sumTreEm = 0;
  let sumTreNho = 0;
  let sumDaThu = 0;
  let sumConThieu = 0;

  bookings.forEach(b => {
    // Status counts
    const st = b.status || 'Giữ chỗ';
    if (st.includes('Giữ chỗ') || st.includes('Mới')) countGiuCho++;
    else if (st.includes('cọc')) countDatCoc++;
    else if (st.includes('toán')) countThanhToan++;

    // Sum Money
    if (st !== 'Huỷ' && st !== 'Hủy') {
       sumDaThu += Number(b.paid || 0);
       sumConThieu += (Number(b.total || 0) - Number(b.paid || 0));
    }

    // Age counts
    const pricingRows = b.raw_details?.pricingRows || [];
    pricingRows.forEach(row => {
       const qty = Number(row.qty || 0);
       if (row.ageType?.includes('Người lớn')) sumNguoiLon += qty;
       else if (row.ageType?.includes('Trẻ em')) sumTreEm += qty;
       else if (row.ageType?.includes('Trẻ nhỏ') || row.ageType?.includes('Em bé')) sumTreNho += qty;
    });
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1600, padding: '20px' }}>
      <div style={{ background: '#f8fafc', borderRadius: '8px', width: '100%', maxWidth: '1400px', height: '95vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        {/* HEADER */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
            DANH SÁCH BOOKING (GIỮ CHỖ)
            <div style={{ fontSize: '14px', color: '#64748b', textTransform: 'none', marginTop: '4px', fontWeight: 'normal' }}>
              {tour?.tour_name || 'Đang tải...'}
            </div>
          </h2>
          <button onClick={onClose} style={{ position: 'absolute', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, background: 'white' }}>
          
          {/* TOP 6 CARDS */}
          <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '20px' }}>
             <div style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)', boxShadow: '0 4px 10px rgba(236,72,153,0.3)', color: 'white', padding: '15px', borderRadius: '8px', position: 'relative', minHeight: '85px', overflow: 'hidden' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', position: 'absolute', top: '8px', right: '15px' }}>{countGiuCho}</div>
                <div style={{ position: 'absolute', bottom: '12px', left: '15px', fontSize: '14px', fontWeight: '500' }}>Giữ chỗ</div>
             </div>
             <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 4px 10px rgba(245,158,11,0.3)', color: 'white', padding: '15px', borderRadius: '8px', position: 'relative', minHeight: '85px', overflow: 'hidden' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', position: 'absolute', top: '8px', right: '15px' }}>{countDatCoc}</div>
                <div style={{ position: 'absolute', bottom: '12px', left: '15px', fontSize: '14px', fontWeight: '500' }}>Đã đặt cọc</div>
             </div>
             <div style={{ background: 'linear-gradient(135deg, #a3e635, #84cc16)', boxShadow: '0 4px 10px rgba(132,204,22,0.3)', color: 'white', padding: '15px', borderRadius: '8px', position: 'relative', minHeight: '85px', overflow: 'hidden' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', position: 'absolute', top: '8px', right: '15px' }}>{countThanhToan}</div>
                <div style={{ position: 'absolute', bottom: '12px', left: '15px', fontSize: '14px', fontWeight: '500' }}>Đã Tất Toán</div>
             </div>
             <div style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', boxShadow: '0 4px 10px rgba(34,197,94,0.3)', color: 'white', padding: '15px', borderRadius: '8px', position: 'relative', minHeight: '85px', overflow: 'hidden' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', position: 'absolute', top: '14px', right: '15px' }}>{formatMoney(sumDaThu)}</div>
                <div style={{ position: 'absolute', bottom: '12px', left: '15px', fontSize: '14px', fontWeight: '500' }}>Tổng Thực Thu</div>
             </div>
             <div style={{ background: 'linear-gradient(135deg, #f87171, #ef4444)', boxShadow: '0 4px 10px rgba(239,68,68,0.3)', color: 'white', padding: '15px', borderRadius: '8px', position: 'relative', minHeight: '85px', overflow: 'hidden' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', position: 'absolute', top: '14px', right: '15px' }}>{formatMoney(sumConThieu)}</div>
                <div style={{ position: 'absolute', bottom: '12px', left: '15px', fontSize: '14px', fontWeight: '500' }}>Còn Thiếu</div>
             </div>
             <div style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', boxShadow: '0 4px 10px rgba(14,165,233,0.3)', color: 'white', padding: '15px', borderRadius: '8px', position: 'relative', minHeight: '85px', overflow: 'hidden' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', position: 'absolute', top: '8px', right: '15px' }}>{sumNguoiLon + sumTreEm + sumTreNho}</div>
                <div style={{ position: 'absolute', bottom: '12px', left: '15px', fontSize: '14px', fontWeight: '500' }}>Tổng Số Khách</div>
             </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '15px' }}>
            <button onClick={onOpenAddCustomer} style={{ background: '#ff5722', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(255,87,34,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}><UserPlus size={18} /> Thêm Giữ chỗ</button>
          </div>

          {/* TABLE */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'left', minWidth: '250px' }}>Khách hàng</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Ngày đặt</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Ngày đóng chỗ</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Thanh toán</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Sales phụ trách</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ padding: '12px', textAlign: 'center', minWidth: '150px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                      Chưa có booking nào. Vui lòng bấm <b>+ Thêm Giữ chỗ</b>
                    </td>
                  </tr>
                ) : (
                  bookings.map((b, idx) => {
                    const raw = b.raw_details || {};
                    const bInfo = raw.bookingInfo || {};
                    const members = raw.members || [];
                    const bdt = new Date(b.created_at || Date.now());
                    
                    const formatDate = (iso) => {
                       if (!iso) return '---';
                       try { return new Date(iso).toLocaleDateString('vi-VN'); } catch(e) { return iso; }
                    };

                    const firstMember = members[0] || {};
                    
                    // Số lượng khách (dựa vào pricingRows)
                    const totalSlots = raw.pricingRows?.reduce((s, r) => s + Number(r.qty || 0), 0) || members.length || b.quantity || 0;
                    // Lọc ra số khách ĐÃ điền thông tin thật sự (Bỏ qua rỗng hoặc tên bắt đầu bằng "Khách ")
                    const filledMembers = members.filter(m => m.name && m.name.trim() !== '' && !m.name.startsWith('Khách ')).length;
                    const missingCount = totalSlots > 0 ? Math.max(0, totalSlots - filledMembers) : 0;
                    
                    const hasAccess = isOwnerOrAdmin(b);
                    const renderMasked = (val, type) => {
                        if (!val || val === '---') return '---';
                        if (hasAccess) return val;
                        const str = String(val).trim();
                        if (type === 'name') {
                            const words = str.split(' ');
                            if (words.length <= 1) return str.substring(0,1) + '***';
                            return words[0] + ' ***';
                        }
                        if (type === 'phone') {
                            return str.length > 5 ? str.substring(0, 3) + '****' + str.substring(str.length - 3) : '***';
                        }
                        if (type === 'id') {
                            return str.length > 4 ? str.substring(0, 2) + '****' + str.substring(str.length - 2) : '***';
                        }
                        return '***';
                    };
                    
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'top' }}>{idx + 1}</td>
                        <td style={{ padding: '15px', verticalAlign: 'top', lineHeight: '1.6' }}>
                           <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                              <b>Tên:</b> {renderMasked(b.name, 'name')} 
                              <span style={{ border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: '12px', padding: '2px 6px', fontSize: '10px' }}>Cá nhân</span>
                              {missingCount > 0 ? (
                                <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: '12px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #f59e0b' }} title="Còn thành viên chưa có đầy đủ Họ tên / SĐT">⚠️ Thiếu TT: {missingCount} khách</span>
                              ) : totalSlots > 0 ? (
                                <span style={{ background: '#dcfce7', color: '#166534', borderRadius: '12px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #86efac' }}>✅ Đủ thông tin {totalSlots} khách</span>
                              ) : null}
                           </div>
                           <div style={{ marginBottom: '4px' }}><b>Điện thoại:</b> {renderMasked(b.phone || firstMember.phone, 'phone')}</div>
                           <div style={{ marginBottom: '4px' }}><b>CMTND:</b> {renderMasked(b.cmnd || firstMember.docId, 'id')}</div>
                           <div style={{ marginBottom: '4px' }}><b>Giới tính:</b> {hasAccess ? (bInfo.gender || firstMember.gender || '---') : '***'}</div>
                           <div style={{ marginBottom: '4px' }}><b>Ngày sinh:</b> {hasAccess ? formatDate(firstMember.dob) : '***'}</div>
                           <div style={{ marginBottom: '4px', position: 'relative', display: 'inline-block' }}>
                              <b>Số lượng:</b>{' '}
                              <span 
                                style={{ cursor: 'help', color: '#2563eb', fontWeight: 'bold', borderBottom: '1px dashed #2563eb', fontSize: '14px' }}
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredQty({ 
                                    id: b.id || idx, 
                                    rows: (raw.pricingRows || []).filter(r => Number(r.qty || 0) > 0),
                                    x: rect.left, 
                                    y: rect.top 
                                  });
                                }}
                                onMouseLeave={() => setHoveredQty({ id: null, rows: [], x: 0, y: 0 })}
                              >
                                {b.qty}
                              </span>
                           </div>
                           {raw.pricingRows?.[0]?.internalNote ? (
                              <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                 <b>Ghi chú:</b> 
                                 <span title={raw.pricingRows[0].internalNote} style={{ cursor: 'help', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                                    Xem chi tiết
                                 </span>
                              </div>
                           ) : (
                              <div style={{ marginBottom: '4px' }}><b>Ghi chú:</b> ---</div>
                           )}
                           <div style={{ marginBottom: '4px' }}><b>Giá NL:</b> {formatMoney(raw.pricingRows?.[0]?.price || 0)}</div>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle', fontSize: '12px' }}>
                           <div style={{ color: '#1d4ed8', fontWeight: 'bold' }}>T.Gian đặt: {bdt.toLocaleDateString('vi-VN')} {bdt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                           <div style={{ marginTop: '8px', background: '#fbcfe8', color: '#be185d', padding: '4px 8px', borderRadius: '12px', display: 'inline-block', fontWeight: 'bold' }}>Mã đặt chỗ:{bInfo.reservationCode || String(b.id || '').substring(0,6) || '---'}</div>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle' }}>11/04/2026</td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                           <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '2px' }}>{formatMoney(b.total)}</div>
                           <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#22c55e', marginBottom: '2px' }}>{formatMoney(b.paid)}</div>
                           <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>{formatMoney(b.total - b.paid)}</div>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle' }}>
                           {b.created_by_name || 'Sales'}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle' }}>
                           <select 
                             value={b.status || 'Mới'} 
                             onChange={async (e) => {
                               const newStatus = e.target.value;
                               if (newStatus === 'Huỷ' || newStatus === 'Hủy') {
                                   if (!window.confirm("⚠️ XÁC NHẬN HỦY CHỖ\nBạn có chắc chắn muốn Hủy Booking này không?\nHành động này sẽ trả lại số ghế trống vào hệ thống phòng vé!")) {
                                       return;
                                   }
                               }

                               try {
                                 // Cập nhật status trong bảng mới riêng cho booking
                                 await axios.put(`/api/op-tours/${tour.id}/bookings/${b.id}`, { status: newStatus }, {
                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                 });
                                 setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, status: newStatus } : bk));
                                 if (onUpdateTour) {
                                    const newTourRes = await axios.get(`/api/op-tours/${tour.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                                    onUpdateTour(newTourRes.data);
                                    if (onRefreshList) onRefreshList();
                                 }
                               } catch (err) { console.error('Lỗi cập nhật trạng thái:', err); alert('Lỗi trạng thái'); }
                             }}
                             style={{ 
                               padding: '6px 8px', 
                               borderRadius: '6px', 
                               border: '1px solid #e2e8f0',
                               fontWeight: 'bold',
                               fontSize: '12px',
                               cursor: 'pointer',
                               background: (b.status || 'Mới') === 'Mới' ? '#f1f5f9' :
                                           (b.status || '').includes('Giữ chỗ') ? '#fff7ed' :
                                           (b.status || '').includes('cọc') ? '#fefce8' :
                                           (b.status || '').includes('toán') ? '#f0fdf4' :
                                           (b.status || '').includes('Hoàn') ? '#f8fafc' :
                                           (b.status || '').includes('uỷ') || (b.status || '').includes('ủy') ? '#fef2f2' : 'white',
                               color: (b.status || 'Mới') === 'Mới' ? '#64748b' :
                                      (b.status || '').includes('Giữ chỗ') ? '#ea580c' :
                                      (b.status || '').includes('cọc') ? '#ca8a04' :
                                      (b.status || '').includes('toán') ? '#16a34a' :
                                      (b.status || '').includes('Hoàn') ? '#475569' :
                                      (b.status || '').includes('uỷ') || (b.status || '').includes('ủy') ? '#dc2626' : '#334155'
                             }}
                             disabled={!isOwnerOrAdmin(b)}
                           >
                             <option value="Mới" disabled={b.status !== 'Mới' && !!(b.paid > 0)}>⚪️ Mới (Chưa giữ chỗ)</option>
                             <option value="Giữ chỗ" disabled={!!(b.paid > 0)}>🟠 Giữ chỗ</option>
                             <option value="Đã đặt cọc" disabled={!(b.paid > 0 && b.paid < b.total)} title={!(b.paid > 0 && b.paid < b.total) ? 'Chỉ hệ thống Kế toán tự chọn lựa chọn này khi Số dư > 0' : 'Sẵn sàng phục hồi'}>🟡 Đã đặt cọc {!(b.paid > 0 && b.paid < b.total) ? '(Auto)' : ''}</option>
                             <option value="Đã thanh toán" disabled={!(b.paid > 0 && b.paid >= b.total)} title={!(b.paid > 0 && b.paid >= b.total) ? 'Hệ thống tự động cập nhật khi Kế toán báo Đã Tất Toán 100%' : 'Sẵn sàng phục hồi'}>🟢 Đã Tất Toán {!(b.paid > 0 && b.paid >= b.total) ? '(Auto)' : ''}</option>
                             <option value="Hoàn thành" disabled={currentUser?.role !== 'admin' && currentUser?.role !== 'manager' && currentUser?.role !== 'operator'}>✅ Hoàn thành</option>
                             <option value="Huỷ">🔴 Huỷ</option>
                           </select>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle', minWidth: '160px' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                              <button onClick={() => window.open(`/service-confirm/${tour.id}/${b.id}`, '_blank')} style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Hợp đồng dịch vụ</button>
                              
                              {isOwnerOrAdmin(b) ? (
                                <>
                                  <button onClick={() => setShowVouchersModal(b)} style={{ width: '100%', background: '#0ea5e9', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Tạo phiếu thu</button>
                                  <button onClick={() => setShowTransferModal(b)} style={{ width: '100%', background: '#f59e0b', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                     <ArrowRight size={14} /> Chuyển tour
                                  </button>
                                  <div style={{ display: 'flex', gap: '15px', marginTop: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                     <Edit2 size={18} color="#475569" cursor="pointer" onClick={() => onEditBooking(b)} title="Chỉnh sửa Booking"/>
                                     <Users size={18} color="#475569" cursor="pointer" title="Danh sách thành viên" onClick={() => setViewingMembers({ booking: b, members: raw.members || [] })} />
                                     <Trash2 size={18} color="#ef4444" cursor="pointer" title="Hủy Booking này"
                                         onClick={async () => {
                                           if (b.status === 'Huỷ' || b.status === 'Hủy') {
                                               alert('Booking này đã ở trạng thái Hủy rồi!');
                                               return;
                                           }
                                           if (!window.confirm(`⚠️ BẠN CÓ CHẮC CHẮN MUỐN HỦY BOOKING NÀY?\n\n- Booking sẽ KHÔNG bị xóa khỏi hệ thống Kế toán để đối chiếu sau này.\n- Trạng thái sẽ chuyển thành NGUY HIỂM (HỦY).\n- Số ghế của Booking sẽ được trả lại cho Kho chỗ.`)) return;
                                           try {
                                             await axios.put(`/api/op-tours/${tour.id}/bookings/${b.id}`, { status: 'Huỷ' }, {
                                               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                             });
                                             setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, status: 'Huỷ' } : bk));
                                             if (onUpdateTour) {
                                               const newTourRes = await axios.get(`/api/op-tours/${tour.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                                               onUpdateTour(newTourRes.data);
                                               if (onRefreshList) onRefreshList();
                                             }
                                             alert('Hủy booking thành công!');
                                           } catch (err) {
                                             alert(err.response?.data?.error || 'Lỗi khi hủy Booking');
                                           }
                                         }}
                                     />
                                  </div>
                                </>
                              ) : (
                                <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', marginTop: '8px', textAlign: 'center', padding: '0 4px' }}>Không có quyền xem chi tiết khách.</div>
                              )}
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DARK TOOLTIP for Qty Breakdown */}
        {hoveredQty.id && (
          <div className="dark-tooltip animate-fade-in" style={{ 
            position: 'fixed',
            top: hoveredQty.y - 8,
            left: hoveredQty.x + 40,
            transform: 'translateY(-100%)',
            pointerEvents: 'none',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            minWidth: '200px',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Users size={16} color="#3b82f6" strokeWidth={3} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CHI TIẾT SỐ LƯỢNG</span>
            </div>
            {hoveredQty.rows.length > 0 ? hoveredQty.rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < hoveredQty.rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 500 }}>{r.ageType}</span>
                <span style={{ fontSize: '1.1rem', color: '#fbbf24', fontWeight: 800, marginLeft: '20px' }}>{r.qty}</span>
              </div>
            )) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Không có dữ liệu</div>
            )}
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>TỔNG</span>
              <span style={{ fontSize: '1.2rem', color: '#22c55e', fontWeight: 900 }}>{hoveredQty.rows.reduce((s, r) => s + Number(r.qty || 0), 0)}</span>
            </div>
          </div>
        )}

        {/* MEMBER LIST SUB-MODAL */}
        {viewingMembers && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1810, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '12px', width: '95%', maxWidth: '1300px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
              {/* Header */}
              <div style={{ padding: '20px 25px', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#ea580c', fontSize: '18px' }}>Danh sách thành viên</h3>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Booking: <b>{viewingMembers.booking?.name}</b> — {viewingMembers.members.length} thành viên</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => {
                      const raw = viewingMembers.booking?.raw_details || {};
                      const inNote = raw.pricingRows?.[0]?.internalNote || '';
                      const cuNote = raw.pricingRows?.[0]?.note || '';
                      const combined = [inNote, cuNote].filter(Boolean).join(' | ');
                      exportChinaTourXlsx(viewingMembers.members, viewingMembers.booking?.name, combined);
                    }}
                    style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <Download size={16} /> Tải DS Tour TQ
                  </button>
                  <button 
                    onClick={() => {
                      const raw = viewingMembers.booking?.raw_details || {};
                      const inNote = raw.pricingRows?.[0]?.internalNote || '';
                      const cuNote = raw.pricingRows?.[0]?.note || '';
                      const combined = [inNote, cuNote].filter(Boolean).join(' | ');
                      exportMembersXlsx(viewingMembers.members, viewingMembers.booking?.name, combined);
                    }}
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <Download size={16} /> Tải xuống danh sách
                  </button>
                  <button onClick={() => setViewingMembers(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <X size={22} color="#64748b" />
                  </button>
                </div>
              </div>
              {/* Table */}
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap' }}>STT</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'left', minWidth: '130px' }}>Tên</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center', minWidth: '110px' }}>Điện thoại</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Giới tính</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Độ tuổi</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center', minWidth: '100px' }}>Ngày sinh</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center', minWidth: '110px' }}>CMT/ Hộ chiếu</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Ngày cấp</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Ngày hết hạn</th>
                      <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Mã phòng</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingMembers.members.length === 0 ? (
                      <tr><td colSpan="11" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chưa có thành viên nào.</td></tr>
                    ) : viewingMembers.members.map((m, i) => (
                      <tr key={m.id || i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>{i + 1}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 600, color: '#1e293b', position: 'relative' }}>
                          {m.name || '---'}
                          {m.passportUrl && (
                             <a href={m.passportUrl.startsWith('/') ? `https://crm.tournuocngoai.com${m.passportUrl}` : m.passportUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #c7d2fe' }} title="Xem Hộ chiếu">
                                <span role="img" aria-label="eye">👁️</span> Xem
                             </a>
                          )}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6366f1' }}>{m.phone || '---'}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{m.gender || '---'}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px' }}>{m.ageType || '---'}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{m.dob || '---'}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{m.docId || '---'}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{m.issueDate || '---'}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{m.expiryDate || '---'}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{m.roomCode || '---'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.note}>
                          {(i === 0 && (() => {
                              const raw = viewingMembers.booking?.raw_details || {};
                              const inNote = raw.pricingRows?.[0]?.internalNote || '';
                              const cuNote = raw.pricingRows?.[0]?.note || '';
                              return [inNote, cuNote].filter(Boolean).join(' | ');
                          })()) ? (() => {
                              const raw = viewingMembers.booking?.raw_details || {};
                              const inNote = raw.pricingRows?.[0]?.internalNote || '';
                              const cuNote = raw.pricingRows?.[0]?.note || '';
                              const combined = [inNote, cuNote].filter(Boolean).join(' | ');
                              return combined + (m.note ? ` - ${m.note}` : '');
                          })() : (m.note || '---')}
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TRANSFER MODAL */}
        {showTransferModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1800, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '20px', width: '600px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid transparent' }}>
                 <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>CHUYỂN TOUR</h3>
                 <button onClick={() => setShowTransferModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', top: '-5px', right: '-5px' }}><X size={20} color="#64748b"/></button>
              </div>
              
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '20px', paddingLeft: '20px' }}>
                 <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Lưu ý: Những tour có thể chuyển sang:</p>
                 <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', fontStyle: 'italic' }}>
                    <li>Sale phải có trong danh sách được bán chỗ</li>
                    <li>Tour mới không ở trạng thái hủy</li>
                    <li>Tour mới còn đủ chỗ</li>
                    <li>Tour mới còn thời gian nhận chỗ</li>
                 </ul>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                 <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#334155' }}>Chọn Lịch Khởi Hành Mới</label>
                 <Select 
                    options={activeTours.map(t => ({ value: t.id, label: `${t.tour_code} - ${t.tour_name}` }))}
                    onChange={opt => setTransferTourId(opt?.value || null)}
                    placeholder="Tìm theo Mã Tour hoặc Tên Tour..."
                    isClearable
                    styles={{ 
                       control: base => ({ ...base, minHeight: '42px', borderColor: '#cbd5e1', borderRadius: '8px', boxShadow: 'none', fontSize: '13px', '&:hover': { borderColor: '#94a3b8' } }),
                       option: base => ({ ...base, fontSize: '13px' })
                    }}
                 />
              </div>

              {transferTourId && activeTours.find(t => t.id === transferTourId) ? (() => {
                 const t = activeTours.find(x => x.id === transferTourId);
                 
                 // Lấy SL Chỗ và Giá
                 const totalSeats = Number(t.max_participants || 0);
                 const soldCount = Number(t.total_sold || 0);
                 const reservedCount = Number(t.total_reserved || 0);
                 const remaining = totalSeats - (soldCount + reservedCount);
                 
                 let priceStr = 'Chưa cập nhật';
                 if (t.actual_price) {
                    priceStr = Number(t.actual_price).toLocaleString('vi-VN') + ' đ';
                 } else {
                    try {
                       const info = typeof t.tour_info === 'string' ? JSON.parse(t.tour_info) : (t.tour_info || {});
                       if (info.price_adult) priceStr = Number(info.price_adult).toLocaleString('vi-VN') + ' đ';
                    } catch(e){}
                 }

                 return (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '20px', transition: 'all 0.3s ease' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <CheckCircle size={20} color="#16a34a" />
                          <span style={{ fontWeight: 'bold', color: '#166534', fontSize: '15px' }}>{t.tour_name}</span>
                       </div>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: '#15803d', fontSize: '13px' }}>
                          <div><strong>Mã Tour:</strong> {t.tour_code}</div>
                          <div><strong>Trạng thái:</strong> <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{t.status}</span></div>
                          <div><strong>Còn trống:</strong> <span style={{ color: remaining <= 0 ? '#ef4444' : '#15803d', fontWeight: 'bold' }}>{remaining}</span> / {totalSeats} chỗ</div>
                          <div><strong>Giá Gốc (Người lớn):</strong> {priceStr}</div>
                          <div style={{ gridColumn: '1 / -1' }}><strong>Khởi hành:</strong> {t.start_date ? new Date(t.start_date).toLocaleDateString('vi-VN') : '---'} <ArrowRight size={12} style={{ margin: '0 5px', verticalAlign: 'middle' }}/> {t.end_date ? new Date(t.end_date).toLocaleDateString('vi-VN') : '---'}</div>
                       </div>
                    </div>
                 )
              })() : (
                 <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#94a3b8', marginBottom: '20px', fontSize: '13px' }}>
                    Vui lòng chọn một Lịch khởi hành ở phía trên để xem chi tiết.
                 </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                 <button onClick={() => setShowTransferModal(null)} disabled={isTransferring} style={{ background: '#f1f5f9', color: '#475569', padding: '10px 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isTransferring ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Đóng
                 </button>
                 <button 
                   onClick={(e) => {
                     e.preventDefault();
                     if (!transferTourId) { alert("Vui lòng chọn Tour muốn chuyển đến."); return; }
                     if (transferTourId === tour.id) { alert("Tour đích bị trùng với Tour hiện tại."); return; }
                     setConfirmTransferModal(true);
                   }} 
                   disabled={isTransferring || !transferTourId}
                   style={{ background: isTransferring || !transferTourId ? '#94a3b8' : '#3b82f6', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isTransferring || !transferTourId ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                 >
                   <ArrowRight size={18} />
                   {isTransferring ? 'Đang chuyển...' : 'Chuyển Booking Sang Tour Này'}
                 </button>
              </div>
            </div>
          </div>
        )}

        {confirmTransferModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
               <h3 style={{ marginTop: 0, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <AlertTriangle size={24}/> Xác Nhận Chuyển Booking
               </h3>
               <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                 Hành động này sẽ chuyển vĩnh viễn Booking này sang Lịch khởi hành mới.<br/><br/>
                 <strong style={{ color: '#0f172a' }}>Lưu ý:</strong> Tất cả lịch sử xuất/thu Tài chính, danh sách thành viên sẽ được giữ nguyên và ăn theo Booking này sang Tour mới.
               </p>
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                 <button onClick={() => setConfirmTransferModal(false)} disabled={isTransferring} style={{ padding: '8px 16px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: isTransferring ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Hủy</button>
                 <button onClick={executeTransfer} disabled={isTransferring} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: isTransferring ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                   {isTransferring ? 'Đang xử lý...' : 'Xác nhận Chuyển'}
                 </button>
               </div>
            </div>
          </div>
        )}

      </div>
      
      {showVouchersModal && (
        <BookingVouchersModal
          booking={showVouchersModal}
          tour={tour}
          onClose={() => setShowVouchersModal(null)}
          onRefresh={() => {
            axios.get(`/api/op-tours/${tour.id}/bookings`, {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }).then(res => setBookings(res.data || []));
            if (onRefreshList) onRefreshList();
          }}
        />
      )}
    </div>
  );
}
