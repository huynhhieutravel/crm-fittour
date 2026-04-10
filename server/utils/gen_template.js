require('dotenv').config();
const db = require('../db');
const XLSX = require('xlsx');

async function run() {
  const result = await db.query('SELECT code, name, duration FROM tour_templates ORDER BY name ASC');
  
  const wb = XLSX.utils.book_new();

  // Sheet 1: NHAP_LICH_KHOI_HANH
  const importHeader = [
    ['HƯỚNG DẪN IMPORT LỊCH KHỞI HÀNH:'],
    ['1. Tên Sản Phẩm Tour (Bắt buộc): Phải copy Tên từ Sheet (DANH SÁCH SẢN PHẨM) sang.'],
    ['2. Mã Lịch KH: Để trống hệ thống sẽ tự động sinh, hoặc tự tạo.'],
    ['3. Ngày: Định dạng DD/MM/YYYY (Ví dụ 20/04/2026).'],
    ['----------------------------------------------------------'],
    [
      'Tên Sản Phẩm Tour (*)', 'Mã Lịch KH', 'Ngày Đi (*)', 'Ngày Về', 
      'Tổng số chỗ', 'Giá Bán NL', 'Giá Bán TE', 'Giá Bán TN', 
      'Phụ thu phòng đơn', 'Ghi chú/Điều hành', 'Điểm đón', 
      'Chuyến đi', 'Chuyến về', 'Hạn nộp Visa'
    ],
    [
      'Tour VÍ DỤ NÈ (Đừng nhập dòng này)', 'SG-BKK-200426', '20/04/2026', '24/04/2026',
      20, 15900000, 14900000, 5000000, 3000000, 'Lưu ý mua SIM', 'Sân bay TSN',
      'VJ801', 'VJ802', '10/04/2026'
    ]
  ];
  const wsImport = XLSX.utils.aoa_to_sheet(importHeader);
  
  wsImport['!cols'] = [
    { wch: 50 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 20 }, { wch: 25 }, { wch: 20 }, 
    { wch: 20 }, { wch: 20 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, wsImport, 'NHAP_LICH_KHOI_HANH');

  // Sheet 2: DANH_SACH_SAN_PHAM
  const sanPhamData = [
    ['TÊN SẢN PHẨM TOUR (Copy dòng này qua sheet Nhập)', 'MÃ SP', 'THỜI GIAN']
  ];
  result.rows.forEach(r => {
    sanPhamData.push([r.name || '', r.code || '', r.duration || '']);
  });
  const wsSanPham = XLSX.utils.aoa_to_sheet(sanPhamData);
  wsSanPham['!cols'] = [{ wch: 60 }, { wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSanPham, 'DANH_SACH_SAN_PHAM');

  XLSX.writeFile(wb, '../client/public/TEMPLATE_LICH_KHOI_HANH.xlsx');
  console.log('DONE!');
  process.exit(0);
}

run();
