import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useMarkets, getChildMarkets } from '../hooks/useMarkets';
import Select from 'react-select';
import { Plus, Search, CalendarDays, Users, Download, X, Plane, Copy } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import OpTourDetailDrawer from '../components/modals/OpTourDetailDrawer';
import OpTourAddCustomerModal from '../components/modals/OpTourAddCustomerModal';
import OpTourBookingListModal from '../components/modals/OpTourBookingListModal';

const MarketFilterBar = ({ activeMarket, setActiveMarket, marketOptions }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const isAll = activeMarket === 'Tất cả';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveMarket('Tất cả')}
          style={{ 
            padding: '6px 16px', borderRadius: '4px', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', border: '1px solid #e2e8f0', cursor: 'pointer',
            backgroundColor: isAll ? 'white' : 'white', color: isAll ? '#1e293b' : '#64748b',
            boxShadow: isAll ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}>
          Tất cả
        </button>
        {marketOptions.map(group => {
           const isGroupActive = activeMarket === group.label || group.options?.some(o => o.value === activeMarket);
           const hasChildren = group.options && group.options.length > 0;
           
           return (
             <div key={group.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                     if (hasChildren) {
                        if (isGroupActive && openDropdown !== group.id) {
                            setOpenDropdown(group.id);
                        } else if (openDropdown === group.id) {
                            setOpenDropdown(null);
                        } else {
                            setActiveMarket(group.label);
                            setOpenDropdown(group.id);
                        }
                     } else {
                        setActiveMarket(group.label);
                        setOpenDropdown(null);
                     }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textTransform: 'uppercase',
                    padding: '6px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', border: '1px solid #e2e8f0',
                    backgroundColor: isGroupActive ? '#ff4b2b' : 'white', color: isGroupActive ? 'white' : '#64748b',
                    boxShadow: isGroupActive ? '0 2px 4px rgba(255, 75, 43, 0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{group.label}</span>
                  {hasChildren && <span style={{ fontSize: '10px', marginLeft: '2px', transition: 'transform 0.2s', transform: openDropdown === group.id ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>}
                </button>
                
                {openDropdown === group.id && hasChildren && (
                   <div style={{
                      position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white',
                      border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      zIndex: 9999, minWidth: '160px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px'
                   }}>
                      <div 
                         onClick={() => { setActiveMarket(group.label); setOpenDropdown(null); }}
                         style={{
                            padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px',
                            backgroundColor: activeMarket === group.label ? '#fff7ed' : 'transparent',
                            color: activeMarket === group.label ? '#ea580c' : '#475569',
                            fontWeight: activeMarket === group.label ? '600' : '500'
                         }}
                         onMouseEnter={(e) => e.target.style.backgroundColor = activeMarket === group.label ? '#fff7ed' : '#f1f5f9'}
                         onMouseLeave={(e) => e.target.style.backgroundColor = activeMarket === group.label ? '#fff7ed' : 'transparent'}
                      >
                         Tất cả {group.label}
                      </div>
                      <div style={{ height: '1px', background: '#e2e8f0', margin: '2px 0' }} />
                      {group.options.map(child => (
                         <div 
                           key={child.id}
                           onClick={() => { setActiveMarket(child.value); setOpenDropdown(null); }}
                           style={{
                              padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px',
                              backgroundColor: activeMarket === child.value ? '#fff7ed' : 'transparent',
                              color: activeMarket === child.value ? '#ea580c' : '#1e293b',
                              fontWeight: activeMarket === child.value ? '600' : '400'
                           }}
                           onMouseEnter={(e) => e.target.style.backgroundColor = activeMarket === child.value ? '#fff7ed' : '#f1f5f9'}
                           onMouseLeave={(e) => e.target.style.backgroundColor = activeMarket === child.value ? '#fff7ed' : 'transparent'}
                         >
                           {child.label}
                         </div>
                      ))}
                   </div>
                )}
             </div>
           );
        })}
    </div>
  );
};

export default function OpToursTab({ currentUser }) {
  const [tours, setTours] = useState([]);
  const marketOptions = useMarkets();
  const [loading, setLoading] = useState(true);
  const [airlinesList, setAirlinesList] = useState([]);
  const [activeMarket, setActiveMarket] = useState('Tất cả');
  const [activeStatus, setActiveStatus] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCreateDate, setFilterCreateDate] = useState('');
  const [filterPayStatus, setFilterPayStatus] = useState('Tất cả');
  const [filterOperator, setFilterOperator] = useState('');
  const [filterTemplate, setFilterTemplate] = useState(() => {
    const saved = sessionStorage.getItem('filterOpTourTemplateId');
    if (saved) {
      sessionStorage.removeItem('filterOpTourTemplateId');
      return saved;
    }
    return '';
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeMarket, activeStatus, filterStartDate, filterEndDate, filterCreateDate, filterOperator, filterPayStatus]);
  
  // Auto-open specific departure drawer via sessionStorage event
  useEffect(() => {
    const pendingId = sessionStorage.getItem('pendingOpenDepartureId');
    if (pendingId && tours.length > 0) {
       const found = tours.find(t => t.id === Number(pendingId));
       if (found) {
          handleOpenDrawer(found);
       }
       sessionStorage.removeItem('pendingOpenDepartureId');
    }
  }, [tours]);
  
  // Modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingBookingData, setEditingBookingData] = useState(null);
  const [selectedCustomerTour, setSelectedCustomerTour] = useState(null);
  const [isBookingListOpen, setIsBookingListOpen] = useState(false);
  const [selectedBookingTour, setSelectedBookingTour] = useState(null);
  const [refreshBookingsTrigger, setRefreshBookingsTrigger] = useState(0);
  const [viewingAllMembers, setViewingAllMembers] = useState(null); // { tour, allMembers }

  const fmtMoney = (v) => Number(v || 0).toLocaleString('vi-VN');

  const openAllMembersList = async (tour) => {
    try {
      const res = await axios.get(`/api/op-tours/${tour.id}/bookings`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const bookings = res.data || [];
      const allMembers = [];
      bookings.forEach(b => {
        const st = b.status || '';
        if (st.includes('uỷ') || st.includes('ủy') || st.includes('Huỷ') || st.includes('Hủy')) return;
        const members = b.raw_details?.members || [];
        const pricingRows = b.raw_details?.pricingRows || [];
        const totalQty = b.qty || pricingRows.reduce((s, r) => s + Number(r.qty || 0), 0) || members.length;
        const salesName = b.created_by_name || 'Sales';
        const tourPrice = (pricingRows && pricingRows.length > 0) ? pricingRows[0].price : (b.raw_details?.price_adult || 0);
        const internalNote = pricingRows[0]?.internalNote || '';
        const custNote = pricingRows[0]?.note || '';
        const bNoteCombined = [internalNote, custNote].filter(Boolean).join(' | ');

        members.forEach((m, mIdx) => {
          allMembers.push({ 
            ...m, 
            bookerName: b.name || '---', 
            bookingId: b.id,
            isBooker: mIdx === 0,
            numSlots: totalQty,
            salesPerson: salesName,
            bTotal: mIdx === 0 ? (b.total || 0) : '',
            bTourPrice: mIdx === 0 ? tourPrice : '',
            bPaid: mIdx === 0 ? (b.paid || 0) : '',
            bRemaining: mIdx === 0 ? ((Number(b.total) || 0) - (Number(b.paid) || 0)) : '',
            bStatus: b.status || 'Giữ chỗ',
            bNote: (mIdx === 0 && bNoteCombined) 
                    ? (bNoteCombined + (m.note ? ` - ${m.note}` : ''))
                    : (m.note || ''),
          });
        });
      });
      setViewingAllMembers({ tour, allMembers });
    } catch(err) {
      console.error(err);
      alert('Không thể tải danh sách thành viên!');
    }
  };

  const exportAllMembersXlsx = () => {
    if (!viewingAllMembers) return;
    const { tour, allMembers } = viewingAllMembers;

    // Count by age type
    let countNL = 0, countTE = 0, countTN = 0;
    allMembers.forEach(m => {
      if (m.ageType?.includes('Người lớn')) countNL++;
      else if (m.ageType?.includes('Trẻ em')) countTE++;
      else if (m.ageType?.includes('Trẻ nhỏ') || m.ageType?.includes('Em bé')) countTN++;
    });

    const tourCode = tour.tour_code || '';
    const tourName = tour.tour_name || '';
    const departDate = tour.start_date ? new Date(tour.start_date).toLocaleDateString('vi-VN') : '';
    const closingDate = tour.end_date ? new Date(tour.end_date).toLocaleDateString('vi-VN') : '';

    const pickupPoint = tour.tour_info?.pickup_point || '';
    const dropoffPoint = tour.tour_info?.dropoff_point || '';
    const operators = tour.tour_info?.operators || '';
    
    let flightItinerary = tour.tour_info?.flight_itinerary || '';
    if (!flightItinerary && (tour.tour_info?.departure_flight || tour.tour_info?.return_flight)) {
       flightItinerary = `${tour.tour_info?.dep_airline || ''} ${tour.tour_info?.departure_flight || ''}`.trim() + (tour.tour_info?.return_flight ? ` - ${tour.tour_info?.ret_airline || ''} ${tour.tour_info?.return_flight || ''}`.trim() : '');
    }

    // Build sheet data
    const wsData = [];
    wsData.push(['', 'DANH SÁCH KHÁCH HÀNG ĐĂNG KÝ TOUR', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', `MÃ TOUR: ${tourCode}`, '', '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', `LỊCH TRÌNH: ${tourName}`, '', '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', 'Ngày khởi hành :', departDate, '', 'Điểm đón :', pickupPoint, '', '', '', '', '', '', '', 'GHI CHÚ ĐẶC BIỆT CHO TOUR', '']);
    wsData.push(['', 'Ngày kết thúc :', closingDate, '', 'Điểm trả :', dropoffPoint, '', '', '', '', '', '', '', '{ GHI CHÚ }', '']);
    wsData.push(['', `Số lượng NL :`, countNL, '', 'Nhân viên điều hành :', operators, '', '', '', '', '', '', '', '', '']);
    wsData.push(['', `Số lượng TE :`, countTE, '', 'Hành trình bay :', flightItinerary, '', '', '', '', '', '', '', '', '']);
    wsData.push(['', `Số lượng TN :`, countTN, '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push([]); // Row 9

    // Row 10: Table header
    const headerRow = [
      'STT',
      'HỌ VÀ TÊN',
      'GIỚI TÍNH',
      'DOB',
      'SỐ HỘ CHIẾU',
      'NGÀY HẾT HẠN',
      'QUỐC TỊCH',
      'SỐ ĐIỆN THOẠI',
      'MÃ PHÒNG',
      'ĐỘ TUỔI',
      'NGÀY CẤP',
      'SALE PHỤ TRÁCH',
      'TỔNG',
      'GIÁ TOUR',
      'ĐÃ CỌC',
      'CÒN LẠI',
      'TRẠNG THÁI TT',
      'GHI CHÚ'
    ];
    wsData.push(headerRow);

    // Data rows
    allMembers.forEach((m, i) => {
      const formatName = (str) => {
          if (!str) return '';
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
      };
      
      wsData.push([
        i + 1,
        formatName(m.name),
        m.gender || '',
        m.dob || '',
        m.docId || '',
        m.expiryDate || '',
        m.nationality || '',
        m.phone || '',
        m.roomCode || '',
        m.ageType || '',
        m.issueDate || '',
        m.salesPerson || '',
        m.bTotal !== '' ? Number(m.bTotal) : '',
        m.bTourPrice !== '' ? Number(m.bTourPrice) : '',
        m.bPaid !== '' ? Number(m.bPaid) : '',
        m.bRemaining !== '' ? Number(m.bRemaining) : '',
        m.isBooker ? m.bStatus : '',
        m.bNote || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Styling configurations
    const borderAll = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    const centerAlign = { vertical: "center", horizontal: "center", wrapText: true };
    const leftAlign = { vertical: "center", horizontal: "left", wrapText: true };
    const rightAlign = { vertical: "center", horizontal: "right" };

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
        
        const cell = ws[cellRef];
        cell.s = { ...cell.s, font: { name: "Times New Roman", sz: 11 } };

        // Title styling (Row 1 to 3)
        if (R >= 0 && R <= 2) {
          cell.s.font.bold = true;
          cell.s.font.sz = R === 0 ? 14 : 12;
          cell.s.alignment = centerAlign;
        }

        // Row 4-8 styling
        if (R >= 3 && R <= 7) {
          cell.s.font.bold = (C === 1 || C === 4);
          cell.s.alignment = { vertical: "center", horizontal: C === 1 || C === 4 ? "right" : "left" };
          
          if (R === 3 && C >= 13) {
            cell.s.font.color = { rgb: "FF0000" };
            cell.s.font.bold = true;
          }
        }

        // Table Header styling
        if (R === 9) {
          cell.s.font.bold = true;
          cell.s.font.color = { rgb: "FFFFFF" };
          cell.s.alignment = centerAlign;
          cell.s.border = borderAll;
          cell.s.fill = { fgColor: { rgb: "1D4ED8" } }; // Modern Blue header
        }

        // Table Data styling
        if (R >= 10) {
          cell.s.border = borderAll;
          cell.s.alignment = centerAlign;
          
          if (R % 2 !== 0 && R > 9) { // Alternate row stripes
            cell.s.fill = { fgColor: { rgb: "F8FAFC" } }; // Light gray/blue
          }
          
          // Specific column alignments
          if (C === 1 || C === 17) cell.s.alignment = leftAlign; // Name, Note
          if (C === 12 || C === 13 || C === 14 || C === 15) {
             cell.s.alignment = rightAlign;
             if(typeof cell.v === 'number') {
                cell.z = '#,##0'; // Number format
             }
          }
        }
      }
    }

    ws['!cols'] = [
      { wch: 6 },   // A: 0 STT
      { wch: 30 },  // B: 1 Name
      { wch: 10 },  // C: 2 Giới tính
      { wch: 16 },  // D: 3 DOB
      { wch: 16 },  // E: 4 Số Hộ chiếu
      { wch: 14 },  // F: 5 Ngày hết hạn
      { wch: 12 },  // G: 6 QUỐC TỊCH
      { wch: 15 },  // H: 7 SĐT
      { wch: 12 },  // I: 8 MÃ PHÒNG
      { wch: 12 },  // J: 9 ĐỘ TUỔI
      { wch: 14 },  // K: 10 NGÀY CẤP
      { wch: 18 },  // L: 11 SALE PHỤ TRÁCH
      { wch: 16 },  // M: 12 TỔNG
      { wch: 16 },  // N: 13 GIÁ TOUR
      { wch: 16 },  // O: 14 ĐÃ CỌC
      { wch: 16 },  // P: 15 CÒN LẠI
      { wch: 18 },  // Q: 16 TRẠNG THÁI TT
      { wch: 25 },  // R: 17 GHI CHÚ
    ];

    ws['!merges'] = [
      // Titles spanning over B to K
      { s: { r: 0, c: 1 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 10 } },
      { s: { r: 2, c: 1 }, e: { r: 2, c: 10 } },
      // Row 4: Ngày khởi hành (C:D), Điểm đón (F:J)
      { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } }, 
      { s: { r: 3, c: 5 }, e: { r: 3, c: 9 } }, 
      { s: { r: 3, c: 13 }, e: { r: 3, c: 17 } }, // Ghi chú đặc biệt
      // Row 5
      { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } }, 
      { s: { r: 4, c: 5 }, e: { r: 4, c: 9 } }, 
      { s: { r: 4, c: 13 }, e: { r: 4, c: 17 } }, 
      // Row 6
      { s: { r: 5, c: 2 }, e: { r: 5, c: 3 } }, 
      { s: { r: 5, c: 5 }, e: { r: 5, c: 9 } }, 
      // Row 7
      { s: { r: 6, c: 2 }, e: { r: 6, c: 3 } }, 
      { s: { r: 6, c: 5 }, e: { r: 6, c: 9 } }, 
      // Row 8
      { s: { r: 7, c: 2 }, e: { r: 7, c: 3 } }, 
    ];

    ws['!rows'] = [];
    for (let i = 0; i < 9; i++) ws['!rows'].push({ hpx: 22 }); 
    ws['!rows'].push({ hpx: 30 }); // Single line header height

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khách');
    const safeName = (tourCode || 'Tour').replace(/[\s\/\\]+/g, '_');
    XLSX.writeFile(wb, `DanhSachKhach_${safeName}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportAllChinaMembersXlsx = () => {
    if (!viewingAllMembers) return;
    const { tour, allMembers } = viewingAllMembers;

    const wsData = [];
    
    // Row 1: Header
    wsData.push(['TRIP INFORMATION AND NAMELIST 行程信息和名单', '', '', '', '', '', '', '', '', '', '']);
    
    // Row 2: Tour Name
    wsData.push(['FIT TOUR', '', '', '', 'Tour 行程', '', 'TP.HCM - THƯỢNG HẢI (TQ)', '', '', '', '']);
    
    // Row 3: Banner & Operator
    wsData.push(['', '', '', '', 'Banner\n欢迎横幅', '', 'WELCOME FIT TOUR', '', 'Điều hành 计调', '', '']);
    
    // Row 4: Tour Leader
    wsData.push(['', '', '', '', 'Tour Leader\n旅游领队', '', '', '', 'HANI NGUYEN', '', '']);
    
    // Row 5: Flight Header
    wsData.push(['FLIGHT DETAIL\n航班详情', '', 'DATE\n日期', 'JOURNEY\n行程', 'FLIGHT NUMBER\n航班', 'DEPARTURE\n起飞 (时间)', 'ARRIVAL\n到达 (时间)', '', '', '', '']);
    
    // Row 6: Flight From
    wsData.push(['From HAN\n胡志明市', '', 'TH26MAR', 'SGN WUH', 'CZ8318', '0240', '0730', '7KG HLXT+\n23KG HLKG', '', '', '']);
    
    // Row 7: Flight Return
    wsData.push(['Return 往回', '', 'WE01APR', 'WUH SGN', 'CZ8317', '2210', '0105+1', '', '', '', '']);
    
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
      'NOTE\n备注'
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

    allMembers.forEach((m, i) => {
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
      
      const note = m.bNote || m.note || '';

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
        note
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const borderAll = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    const centerAlign = { vertical: "center", horizontal: "center", wrapText: true };
    const orangeBg = { fgColor: { rgb: "ED7D31" } };

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

        if (R > 8 && C === 1) cell.s.font.color = { rgb: "FF0000" };
        if (R > 8 && C === 2) { cell.s.font.color = { rgb: "FF0000" }; cell.s.font.bold = true; }
        if (R === 3 && C === 8) cell.s.font.color = { rgb: "FF0000" };
        if ((R === 5 || R === 6) && (C >= 2 && C <= 7)) {
           cell.s.font.color = { rgb: "FF0000" };
           cell.s.font.bold = true;
           cell.s.alignment = centerAlign;
        }
        
        if (R >= 8) cell.s.alignment = centerAlign;
      }
    }

    ws['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 0 }, e: { r: 3, c: 3 } }, 
      { s: { r: 1, c: 4 }, e: { r: 1, c: 5 } }, 
      { s: { r: 1, c: 6 }, e: { r: 1, c: 10 } }, 
      { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } }, 
      { s: { r: 2, c: 6 }, e: { r: 2, c: 7 } }, 
      { s: { r: 2, c: 8 }, e: { r: 2, c: 10 } }, 
      { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } }, 
      { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } }, 
      { s: { r: 3, c: 8 }, e: { r: 3, c: 10 } }, 
      
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, 
      { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } }, 
      { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } }, 
      { s: { r: 4, c: 7 }, e: { r: 6, c: 10 } },
    ];

    ws['!rows'] = [{ hpx: 30 }, { hpx: 25 }, { hpx: 25 }, { hpx: 25 }, { hpx: 35 }, { hpx: 35 }, { hpx: 35 }];
    ws['!rows'][8] = { hpx: 35 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khách TQ');
    const safeTourName = (tour?.tour_code || 'Tour').replace(/[\s\/\\]+/g, '_');
    XLSX.writeFile(wb, `DS_TQ_${safeTourName}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  useEffect(() => {
    fetchTours();
    axios.get('/api/airlines?limit=1000', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setAirlinesList(res.data.data || []))
      .catch(console.error);
  }, []);

  const fetchTours = async () => {
    try {
      const response = await axios.get('/api/op-tours', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTours(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching OP tours:', error);
      setLoading(false);
    }
  };

  const handleOpenDrawer = (tour = null) => {
    setSelectedTour(tour);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTour(null);
    fetchTours(); // Refresh after edit
  };

  const handleOpenCustomerModal = (tourOrEvent) => {
    // If it's a tour object (has 'id'), set it as the active tour for booking
    // This allows the '+ Giữ chỗ' button on the outer table to work correctly
    if (tourOrEvent && typeof tourOrEvent === 'object' && tourOrEvent.id) {
      setSelectedBookingTour(tourOrEvent);
    }
    setEditingBookingData(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditBooking = (booking) => {
    setEditingBookingData(booking);
    setIsCustomerModalOpen(true);
  };

  const handleOpenBookingList = (tour) => {
    setSelectedBookingTour(tour);
    setIsBookingListOpen(true);
  };


  const handleDeleteTour = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tour này?')) {
      try {
        await axios.delete(`/api/op-tours/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchTours();
      } catch (error) {
        console.error('Lỗi khi xóa', error);
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  }

  const handleCopyTour = (tour) => {
    // Auto-generate tour code: {TEMPLATE_CODE}-{YYYYMMDD}
    // Set a default based on the previous code and previous start date (if any).
    // The user will change start_date which will auto-update this via handleChange in OpTourDetailDrawer.
    const baseCode = tour.template_code || tour.tour_code?.split('-')[0] || 'TOUR';
    const dateStr = tour.start_date ? new Date(tour.start_date).toLocaleDateString('en-CA').replace(/-/g, '') : '';
    const newCode = dateStr ? `${baseCode}-${dateStr}` : `${baseCode}-COPY`;

    const cloned = {
      tour_code: newCode,
      tour_name: tour.tour_name || '',
      tour_template_id: tour.tour_template_id || '',
      start_date: tour.start_date ? new Date(tour.start_date).toLocaleDateString('en-CA') : '',
      end_date: tour.end_date ? new Date(tour.end_date).toLocaleDateString('en-CA') : '',
      market: tour.market || '',
      status: 'Mở bán',
      tour_info: { ...(tour.tour_info || {}) },
      expenses: tour.expenses ? JSON.parse(JSON.stringify(tour.expenses)) : [],
      guides: tour.guides ? JSON.parse(JSON.stringify(tour.guides)) : [],
      itinerary: tour.itinerary || '',
      _isCopy: true,
    };
    setSelectedTour(cloned);
    setIsDrawerOpen(true);
  };

  // Derive unique markets from data dynamically
  const uniqueMarkets = ['Tất cả', ...new Set(tours.map(t => t.market).filter(Boolean))];
  const uniqueStatuses = ['Tất cả', ...new Set(tours.map(t => t.status).filter(Boolean))];

  // Filtering
  const filteredTours = tours.filter(t => {
    const matchSearch = t.tour_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.tour_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const childMarkets = getChildMarkets(activeMarket, marketOptions);
    const tourMarkets = t.market ? t.market.split(',').map(m => m.trim()) : [];
    const matchMarket = activeMarket === 'Tất cả' || 
                        tourMarkets.includes(activeMarket) || 
                        tourMarkets.some(m => childMarkets.includes(m));
    const matchStatus = 
      activeStatus === 'Tất cả' || 
      t.status === activeStatus || 
      (activeStatus === 'Mở bán' && !t.status) ||
      (activeStatus === 'Còn chỗ' && Number(t.tour_info?.total_seats || t.max_participants || 0) > 0 && (Number(t.tour_info?.total_seats || t.max_participants || 0) - Number(t.total_sold || 0) - Number(t.total_reserved || 0)) > 0 && t.status !== 'Hoàn thành' && t.status !== 'Huỷ' && t.status !== 'Hủy') ||
      (activeStatus === 'Hết chỗ' && Number(t.tour_info?.total_seats || t.max_participants || 0) > 0 && (Number(t.total_sold || 0) + Number(t.total_reserved || 0)) >= Number(t.tour_info?.total_seats || t.max_participants || 0) && t.status !== 'Hoàn thành' && t.status !== 'Huỷ' && t.status !== 'Hủy');

    
    const matchStart = filterStartDate ? new Date(t.start_date) >= new Date(filterStartDate) : true;
    const matchEnd = filterEndDate ? new Date(t.end_date) <= new Date(filterEndDate) : true;
    const matchCreated = filterCreateDate && t.created_at ? new Date(t.created_at) >= new Date(filterCreateDate) : true;
    const matchOp = filterOperator && filterOperator !== 'Chọn' ? t.tour_info?.operators?.toLowerCase().includes(filterOperator.toLowerCase()) : true;
    const matchTemplate = !filterTemplate || (t.tour_template_id && Number(t.tour_template_id) === Number(filterTemplate));
    
    return matchSearch && matchMarket && matchStatus && matchStart && matchEnd && matchCreated && matchOp && matchTemplate;
  });

  const uniqueTemplates = Array.from(
    new Map(
      tours.filter(t => t.tour_template_id).map(t => [t.tour_template_id, { id: t.tour_template_id, name: t.tour_name }])
    ).values()
  );

  const countAll = tours.length;
  
  const actualItemsPerPage = itemsPerPage === 'all' ? Math.max(1, filteredTours.length) : itemsPerPage;
  const totalPages = Math.ceil(filteredTours.length / actualItemsPerPage) || 1;
  const currentTours = filteredTours.slice((currentPage - 1) * actualItemsPerPage, currentPage * actualItemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const countOpen = tours.filter(t => t.status === 'Mở bán' || !t.status).length;
  const countGuaranteed = tours.filter(t => t.status === 'Chắc chắn đi').length;
  const countFull = tours.filter(t => t.status === 'Đã đầy').length;
  const countCompleted = tours.filter(t => t.status === 'Hoàn thành').length;
  const countCancelled = tours.filter(t => t.status === 'Hủy' || t.status === 'Huỷ').length;

  const countAvailableTours = tours.filter(t => {
    if (t.status === 'Hoàn thành' || t.status === 'Huỷ' || t.status === 'Hủy') return false;
    const total = Number(t.tour_info?.total_seats || t.max_participants || 0);
    if (total === 0) return false;
    const sold = Number(t.total_sold || 0);
    const reserved = Number(t.total_reserved || 0);
    return (total - sold - reserved) > 0;
  }).length;

  const countSoldOutTours = tours.filter(t => {
    if (t.status === 'Hoàn thành' || t.status === 'Huỷ' || t.status === 'Hủy') return false;
    const total = Number(t.tour_info?.total_seats || t.max_participants || 0);
    if (total === 0) return false;
    const sold = Number(t.total_sold || 0);
    const reserved = Number(t.total_reserved || 0);
    return (sold + reserved) >= total;
  }).length;

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="tab-pane active" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>Lịch khởi hành (Tour FIT)</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Quản lý Lịch khởi hành và Tổng số chỗ</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer(null)}
          style={{
            background: '#ff5722',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <Plus size={18} /> TẠO TOUR MỚI
        </button>
      </div>

      {/* Summary Top Cards */}
      <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '20px' }}>
         <div onClick={() => setActiveStatus('Tất cả')} style={{ background: '#f97316', color: 'white', padding: '15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Tổng số Tour</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{countAll}</div>
         </div>
         <div onClick={() => setActiveStatus('Mở bán')} style={{ background: '#0ea5e9', color: 'white', padding: '15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Mở bán</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{countOpen}</div>
         </div>
         <div onClick={() => setActiveStatus('Chắc chắn đi')} style={{ background: '#ec4899', color: 'white', padding: '15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Chắc chắn đi</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{countGuaranteed}</div>
         </div>
         <div onClick={() => setActiveStatus('Đã đầy')} style={{ background: '#8b5cf6', color: 'white', padding: '15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Đã đầy</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{countFull}</div>
         </div>
         <div onClick={() => setActiveStatus('Hoàn thành')} style={{ background: '#84cc16', color: 'white', padding: '15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Hoàn thành</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{countCompleted}</div>
         </div>
         <div onClick={() => setActiveStatus('Huỷ')} style={{ background: '#ea580c', color: 'white', padding: '15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Huỷ</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{countCancelled}</div>
         </div>
      </div>

      {/* Advanced Filter Form Row */}
      <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '20px', overflowX: 'auto' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>Tìm kiếm:</label>
          <input type="text" placeholder="Mã, tên tour.." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>Sản phẩm Tour:</label>
          <select value={filterTemplate} onChange={e => setFilterTemplate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', outline: 'none' }}>
             <option value="">-- Tất cả SP Tour --</option>
             {uniqueTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>Ngày Khởi hành:</label>
          <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>Ngày kết thúc:</label>
          <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>Ngày tạo:</label>
          <input type="date" value={filterCreateDate} onChange={e => setFilterCreateDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>Tình trạng:</label>
          <select value={activeStatus} onChange={e => setActiveStatus(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', outline: 'none' }}>
             {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>TT thanh toán:</label>
          <select value={filterPayStatus} onChange={e => setFilterPayStatus(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', outline: 'none' }}>
             <option value="Tất cả">Tất cả</option>
             <option value="Chưa Thanh Toán">Chưa thanh toán</option>
             <option value="Đã cọc">Đã cọc</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>Sắp xếp:</label>
          <select style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', outline: 'none' }}>
             <option>Ngày đóng chỗ (Mặc định)</option>
             <option>Ngày khởi hành</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '500' }}>NVĐH/ Duyệt:</label>
          <select value={filterOperator} onChange={e => setFilterOperator(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', outline: 'none' }}>
             <option value="Chọn">Chọn</option>
          </select>
        </div>
        <button style={{ background: '#3b82f6', color: 'white', padding: '0 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Search size={16} />
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
         <div style={{ color: '#ea580c', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px' }}>▼</span> Xem thêm bộ lọc
         </div>
      </div>

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
         <button onClick={() => handleOpenDrawer(null)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
           <Plus size={14} /> Tạo tour
         </button>
         <button onClick={exportAllMembersXlsx} style={{ background: '#f97316', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
           <Plus size={14} /> Export
         </button>
         <button onClick={() => window.open('/simple-list-share/lich_dai_ly', '_blank')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
           <Users size={14} /> Lịch cho đại lý
         </button>
      </div>

      {/* Market Filter: Pill Action Bar */}
      <div style={{ marginBottom: '15px' }}>
         <MarketFilterBar 
            activeMarket={activeMarket} 
            setActiveMarket={setActiveMarket} 
            marketOptions={marketOptions} 
         />
      </div>
      <hr style={{ borderTop: '1px solid #e2e8f0', margin: '0 0 15px 0' }} />

      {/* Sub Status Row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '13px', overflowX: 'auto', alignItems: 'center' }}>
         <span onClick={() => setActiveStatus('Tất cả')} style={{ cursor: 'pointer', color: activeStatus === 'Tất cả' ? '#1e293b' : '#64748b', fontWeight: activeStatus === 'Tất cả' ? 'bold' : 'normal', borderBottom: activeStatus === 'Tất cả' ? '2px solid #10b981' : 'none', paddingBottom: '3px' }}>Tất cả ({countAll})</span>
         <span onClick={() => setActiveStatus('Mở bán')} style={{ cursor: 'pointer', color: activeStatus === 'Mở bán' ? '#1e293b' : '#64748b', fontWeight: activeStatus === 'Mở bán' ? 'bold' : 'normal', borderBottom: activeStatus === 'Mở bán' ? '2px solid #10b981' : 'none', paddingBottom: '3px' }}>Mở bán ({countOpen})</span>
         <span onClick={() => setActiveStatus('Chắc chắn đi')} style={{ cursor: 'pointer', color: activeStatus === 'Chắc chắn đi' ? '#1e293b' : '#64748b', fontWeight: activeStatus === 'Chắc chắn đi' ? 'bold' : 'normal', borderBottom: activeStatus === 'Chắc chắn đi' ? '2px solid #10b981' : 'none', paddingBottom: '3px' }}>Chắc chắn đi ({countGuaranteed})</span>
         <span onClick={() => setActiveStatus('Đã đầy')} style={{ cursor: 'pointer', color: activeStatus === 'Đã đầy' ? '#1e293b' : '#64748b', fontWeight: activeStatus === 'Đã đầy' ? 'bold' : 'normal', borderBottom: activeStatus === 'Đã đầy' ? '2px solid #10b981' : 'none', paddingBottom: '3px' }}>Đã đầy ({countFull})</span>
         <span onClick={() => setActiveStatus('Hoàn thành')} style={{ cursor: 'pointer', color: activeStatus === 'Hoàn thành' ? '#1e293b' : '#64748b', fontWeight: activeStatus === 'Hoàn thành' ? 'bold' : 'normal', borderBottom: activeStatus === 'Hoàn thành' ? '2px solid #10b981' : 'none', paddingBottom: '3px' }}>Hoàn thành ({countCompleted})</span>
         <span onClick={() => setActiveStatus('Huỷ')} style={{ cursor: 'pointer', color: activeStatus === 'Huỷ' ? '#1e293b' : '#64748b', fontWeight: activeStatus === 'Huỷ' ? 'bold' : 'normal', borderBottom: activeStatus === 'Huỷ' ? '2px solid #10b981' : 'none', paddingBottom: '3px' }}>Huỷ ({countCancelled})</span>
         
         {/* System calculated metrics */}
         <span onClick={() => setActiveStatus('Còn chỗ')} style={{ cursor: 'pointer', color: activeStatus === 'Còn chỗ' ? '#1e293b' : '#3b82f6', fontWeight: activeStatus === 'Còn chỗ' ? 'bold' : 'normal', borderBottom: activeStatus === 'Còn chỗ' ? '2px solid #3b82f6' : 'none', paddingBottom: '3px' }}>Còn chỗ ({countAvailableTours})</span>
         <span onClick={() => setActiveStatus('Hết chỗ')} style={{ cursor: 'pointer', color: activeStatus === 'Hết chỗ' ? '#1e293b' : '#ef4444', fontWeight: activeStatus === 'Hết chỗ' ? 'bold' : 'normal', borderBottom: activeStatus === 'Hết chỗ' ? '2px solid #ef4444' : 'none', paddingBottom: '3px' }}>Hết chỗ ({countSoldOutTours})</span>
      </div>

      {/* Primary Table - Compact Design */}
      <div style={{ background: 'white', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#1e293b', borderTop: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 8px', width: '30px' }}><input type="checkbox" /></th>
              <th style={{ padding: '12px 8px', width: '30px', fontWeight: 'bold' }}>STT</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold' }}>Sản phẩm Tour</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Ngày khởi hành</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'right' }}>Giá</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Hoa<br/>Hồng</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Đã thu<br/>(Cọc)</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Tổng<br/>chỗ</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Giữ<br/>chỗ</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Đã<br/>bán</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Còn lại</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Ngày đóng<br/>chỗ</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Ghi chú</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'right' }}>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {currentTours.map((tour, mapIndex) => {
              const index = (currentPage - 1) * actualItemsPerPage + mapIndex;
              const total = Number(tour.tour_info?.total_seats || 0);
              
              // Data already aggregated by Server in Phase 3 refactor
              let reservedQty = Number(tour.total_reserved || 0);
              let soldQty = Number(tour.total_sold || 0);
              let totalPaid = Number(tour.total_paid || 0);
              let totalComm = 0; // Comm calculated server-side in future if needed

              const reservedTooltip = 'Xem trong danh sách';
              const soldTooltip = 'Xem trong danh sách';

              const remaining = total - soldQty - reservedQty;
              
              return (
              <tr key={tour.id} style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                <td style={{ padding: '12px 8px', borderLeft: '5px solid #fbbf24' }}><input type="checkbox" /></td>
                <td style={{ padding: '12px 8px', color: '#64748b' }}>{index + 1}</td>
                <td style={{ padding: '12px 8px' }}>
                   {tour.tour_info?.internal_notes && (
                      <div className="note-tooltip-container" style={{ display: 'inline-flex', position: 'relative', alignItems: 'center', marginBottom: '4px' }}>
                         <span title="Có ghi chú nội bộ" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'help', fontWeight: 'bold' }}>
                            📌 GHI CHÚ LƯU Ý
                         </span>
                         <div className="note-tooltip" style={{
                            position: 'absolute', bottom: '100%', left: '0', marginBottom: '8px',
                            background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e',
                            padding: '10px 12px', borderRadius: '6px', fontSize: '12px',
                            width: 'max-content', maxWidth: '300px', zIndex: 50,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            display: 'none', whiteSpace: 'pre-wrap', fontWeight: 'normal'
                         }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px', borderBottom: '1px solid #fcd34d', paddingBottom: '4px' }}>📌 Ghi chú nội bộ:</div>
                            {tour.tour_info.internal_notes}
                         </div>
                      </div>
                   )}
                   <style>{`
                      .note-tooltip-container:hover .note-tooltip { display: block !important; }
                   `}</style>
                   <div style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', marginBottom: '4px', fontSize: '12px' }} onClick={() => handleOpenDrawer(tour)}>
                      {tour.tour_code}
                   </div>
                   <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#1e293b' }}>
                      {tour.tour_name}
                   </div>
                   <div style={{ color: '#64748b', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                     {(() => {
                        const info = tour.tour_info || {};
                        const transport = info.transport || info.vehicle;
                        if (transport && transport !== 'Đường hàng không' && transport !== 'Hàng không') {
                           return <div><span role="img" aria-label="car">🚌</span> {transport}</div>;
                        }

                        const depAirlineName = info.dep_airline;
                        const depFlight = info.departure_flight;
                        const retAirlineName = info.ret_airline;
                        const retFlight = info.return_flight;
                        
                        const depAir = airlinesList.find(a => a.name === depAirlineName || `${a.code} - ${a.name}` === depAirlineName);
                        const retAir = airlinesList.find(a => a.name === retAirlineName || `${a.code} - ${a.name}` === retAirlineName);

                        if (!depAirlineName && !retAirlineName) return <div><span role="img" aria-label="plane">✈️</span> Hàng không</div>;

                        return (
                          <>
                             {depAirlineName && depFlight && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '6px' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ width: '90px', height: '35px', display: 'flex', alignItems: 'center' }}>
                                         {depAir?.logo_url ? <img src={`/airlines/${depAir.logo_url}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="logo" /> : <Plane size={20} color="#64748b" />}
                                      </div>
                                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>{String(depFlight).split(' ')[0]}</span>
                                   </div>
                                   <div style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontWeight: 600 }}>{info.pickup_point || 'Khác'}</span>
                                      <span style={{ color: '#94a3b8', fontSize: '14px' }}>➔</span>
                                      <span style={{ fontWeight: 600 }}>{info.dropoff_point || 'Khác'}</span>
                                   </div>
                                </div>
                             )}
                             {retAirlineName && retFlight && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ width: '90px', height: '35px', display: 'flex', alignItems: 'center' }}>
                                         {retAir?.logo_url ? <img src={`/airlines/${retAir.logo_url}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="logo" /> : <Plane size={20} color="#64748b" />}
                                      </div>
                                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>{String(retFlight).split(' ')[0]}</span>
                                   </div>
                                   <div style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontWeight: 600 }}>{info.dropoff_point || 'Khác'}</span>
                                      <span style={{ color: '#94a3b8', fontSize: '14px' }}>➔</span>
                                      <span style={{ fontWeight: 600 }}>{info.pickup_point || 'Khác'}</span>
                                   </div>
                                </div>
                             )}
                          </>
                        );
                     })()}
                   </div>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold' }}>
                   {tour.start_date ? new Date(tour.start_date).toLocaleDateString('vi-VN') : '---'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold' }}>
                    {tour.tour_info?.price_adult?.toLocaleString() || '---'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                    {totalComm.toLocaleString()}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#22c55e', fontWeight: 'bold' }}>
                    {totalPaid.toLocaleString()}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold' }}>
                    {total}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold' }}>
                    {reservedQty}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#2563eb', fontWeight: 'bold' }}>
                    {soldQty}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>
                    {remaining}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b' }}>
                    {tour.tour_info?.closing_date ? new Date(tour.tour_info.closing_date).toLocaleDateString('vi-VN') : '---'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b' }}>
                    {tour.notes || ''}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleOpenBookingList(tour)}
                      style={{ width: '85px', background: '#22c55e', color: 'white', border: 'none', padding: '5px 0', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                    >
                      + Giữ chỗ
                    </button>
                    <button 
                      onClick={() => handleCopyTour(tour)}
                      style={{ width: '85px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '4px 0', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                    <button 
                      onClick={() => openAllMembersList(tour)}
                      style={{ width: '85px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 0', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                    >
                      <Users size={12} /> DS Khách
                    </button>
                    {currentUser?.role_name === 'admin' && (
                      <button onClick={() => handleDeleteTour(tour.id)} style={{ width: '85px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}>Xóa tour</button>
                    )}
                  </div>
                </td>
              </tr>
            )})}
            {filteredTours.length === 0 && (
              <tr>
                <td colSpan="14" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy tour nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 1rem', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Hiển thị:</span>
          <select
            style={{ padding: '4px 24px 4px 12px', height: '32px', fontSize: '13px', borderRadius: '6px', fontWeight: 600, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', minWidth: '70px', margin: 0 }}
            value={itemsPerPage}
            onChange={(e) => {
              const val = e.target.value;
              setItemsPerPage(val === 'all' ? 'all' : parseInt(val, 10));
              setCurrentPage(1);
            }}
          >
            <option value={30}>30 dòng</option>
            <option value={50}>50 dòng</option>
            <option value={100}>100 dòng</option>
            <option value={300}>300 dòng</option>
            <option value={1000}>1000 dòng</option>
            <option value="all">Tất cả</option>
          </select>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
            Hiển thị {currentTours.length} / {filteredTours.length} tour
          </span>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === 1 ? '#cbd5e1' : '#475569', fontSize: '13px' }}
            >
              Trang trước
            </button>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: '0 8px' }}>
              Trang {currentPage} / {totalPages}
            </div>
            <button 
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === totalPages ? '#cbd5e1' : '#475569', fontSize: '13px' }}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {isDrawerOpen && (
        <OpTourDetailDrawer 
          onClose={handleCloseDrawer} 
          tour={selectedTour} 
        />
      )}

      <OpTourBookingListModal
        isOpen={isBookingListOpen}
        onClose={() => setIsBookingListOpen(false)}
        tour={selectedBookingTour}
        onOpenAddCustomer={handleOpenCustomerModal}
        onEditBooking={handleEditBooking}
        onUpdateTour={setSelectedBookingTour}
        onRefreshList={fetchTours}
        currentUser={currentUser}
        refreshTrigger={refreshBookingsTrigger}
      />

      <OpTourAddCustomerModal 
        isOpen={isCustomerModalOpen} 
        initialData={editingBookingData}
        currentUser={currentUser}
        onClose={() => setIsCustomerModalOpen(false)} 
        onSave={async (data) => {
          try {
            await axios.post(`/api/op-tours/${selectedBookingTour.id}/bookings`, data, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log('Saved booking successfully!');
            setIsCustomerModalOpen(false);
            
            // Fetch single tour and update modal instantly
            const tourRes = await axios.get(`/api/op-tours/${selectedBookingTour.id}`, {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSelectedBookingTour(tourRes.data);
            
            // Update outer list in background
            fetchTours();
            setRefreshBookingsTrigger(prev => prev + 1);
          } catch (err) {
            console.error('Lỗi khi lưu Booking:', err);
            const msg = err.response?.data?.error || 'Lỗi khi lưu Booking. Vui lòng thử lại!';
            alert(msg);
          }
        }}
      />

      {/* ALL MEMBERS MODAL */}
      {viewingAllMembers && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '95%', maxWidth: '1300px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ padding: '20px 25px', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#ea580c', fontSize: '18px' }}>Danh sách thành viên</h3>
                <div style={{ color: '#ea580c', borderBottom: '2px dashed #fed7aa', paddingBottom: '4px', marginTop: '2px' }}></div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>Tour: <b>{viewingAllMembers.tour?.tour_code}</b> — {viewingAllMembers.tour?.tour_name} — <span style={{ color: '#2563eb', fontWeight: 700 }}>{viewingAllMembers.allMembers.length} thành viên</span></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={exportAllChinaMembersXlsx}
                  style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <Download size={16} /> Tải DS Tour TQ
                </button>
                <button 
                  onClick={exportAllMembersXlsx}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <Download size={16} /> Tải xuống danh sách
                </button>
                <button onClick={() => setViewingAllMembers(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                  <X size={22} color="#64748b" />
                </button>
              </div>
            </div>
            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                    {['STT', 'Tên', 'Phân loại', 'Giới tính', 'Ngày sinh', 'Số hộ chiếu/CMT', 'Ngày hết hạn', 'Quốc tịch', 'Số điện thoại', 'Mã phòng', 'Độ tuổi', 'Ngày cấp', 'Sale phụ trách', 'Tổng', 'Giá Tour', 'Đã cọc', 'Còn lại', 'Trạng thái thanh toán', 'Ghi chú'].map((h, hi) => (
                      <th key={hi} style={{ padding: '8px 6px', borderRight: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 700, color: '#334155' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewingAllMembers.allMembers.length === 0 ? (
                    <tr><td colSpan="20" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chưa có thành viên nào.</td></tr>
                  ) : viewingAllMembers.allMembers.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                      <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 'bold', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{i + 1}</td>
                      <td style={{ padding: '8px 6px', fontWeight: 600, color: m.isBooker ? '#ea580c' : '#1e293b', borderRight: '1px solid #f1f5f9', minWidth: '130px' }}>
                        {m.name || '---'}
                        {m.isBooker && <span style={{ color: '#ea580c' }}>*</span>}
                        {m.isBooker && <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 700 }}>Số chỗ: {m.numSlots}</div>}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #f1f5f9', minWidth: '100px' }}>
                         {(m.customerSegment || (m.tripCount > 0)) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                               <span style={{
                                  padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
                                  ...(m.customerSegment === 'VIP 1' ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } : 
                                      m.customerSegment === 'VIP 2' ? { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' } : 
                                      m.customerSegment === 'VIP 3' ? { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' } : 
                                      m.customerSegment === 'Repeat Customer' ? { background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' } : 
                                      { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' })
                               }}>
                                  {m.customerSegment === 'VIP 1' ? '⭐⭐⭐ VIP 1' :
                                   m.customerSegment === 'VIP 2' ? '⭐⭐ VIP 2' :
                                   m.customerSegment === 'VIP 3' ? '⭐ VIP 3' :
                                   m.customerSegment || 'Khách Cũ'}
                               </span>
                               {m.tripCount > 0 && <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{m.tripCount} chuyến</span>}
                            </div>
                         ) : m.phone ? (
                            <span style={{ padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Khách mới</span>
                         ) : null}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>{m.gender || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>{m.dob || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>{m.docId || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>{m.expiryDate || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>{m.nationality || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: '#6366f1', borderRight: '1px solid #f1f5f9' }}>{m.phone || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>{m.roomCode || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', borderRight: '1px solid #f1f5f9' }}>{m.ageType || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>{m.issueDate || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', borderRight: '1px solid #f1f5f9' }}>{m.salesPerson || ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: m.bTotal !== '' ? 700 : 400, borderRight: '1px solid #f1f5f9' }}>{m.bTotal !== '' ? fmtMoney(m.bTotal) : ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', borderRight: '1px solid #f1f5f9' }}>{m.bTourPrice ? fmtMoney(m.bTourPrice) : ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', color: m.bPaid !== '' ? '#16a34a' : '', fontWeight: m.bPaid !== '' ? 700 : 400, borderRight: '1px solid #f1f5f9' }}>{m.bPaid !== '' ? fmtMoney(m.bPaid) : ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', color: m.bRemaining !== '' && m.bRemaining > 0 ? '#ef4444' : '', fontWeight: m.bRemaining !== '' ? 700 : 400, borderRight: '1px solid #f1f5f9' }}>{m.bRemaining !== '' ? fmtMoney(m.bRemaining) : ''}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', borderRight: '1px solid #f1f5f9' }}>
                        {m.isBooker && (
                          <span style={{ 
                            padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                            background: (m.bStatus||'').includes('toán') ? '#dcfce7' : (m.bStatus||'').includes('cọc') ? '#fef9c3' : '#fff7ed',
                            color: (m.bStatus||'').includes('toán') ? '#16a34a' : (m.bStatus||'').includes('cọc') ? '#ca8a04' : '#ea580c'
                          }}>
                            {m.bStatus}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'left', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.bNote}>{m.bNote || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
