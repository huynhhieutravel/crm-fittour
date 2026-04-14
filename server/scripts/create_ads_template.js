const XLSX = require('xlsx');
const fs = require('fs');

const data = [
  {
    "Tên chiến dịch": "BU1 - CHIẾN DỊCH TRUNG QUỐC",
    "Tên nhóm quảng cáo": "BU1 - CHIẾN DỊCH - TIN NHẮN",
    "Tên quảng cáo": "TÂN CƯƠNG QUÝ 1 2026",
    "Người tiếp cận": 77349,
    "Lượt hiển thị": 129743,
    "Số tiền đã chi tiêu (VND)": 1928606,
    "Lượt bắt đầu cuộc trò chuyện qua tin nhắn": 76,
    "Khách hàng tiềm năng": 19,
    "Chi phí / tin nhắn": 25376,
    "Chi phí / lead": 101505
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

const dir = '../client/public/manual_images';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

XLSX.writeFile(workbook, '../client/public/manual_images/TEMPLATE_MARKETING_ADS_FIT_TOUR.xlsx');
console.log('Template created successfully at client/public/manual_images/TEMPLATE_MARKETING_ADS_FIT_TOUR.xlsx');
