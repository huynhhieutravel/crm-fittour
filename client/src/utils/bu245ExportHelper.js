import axios from 'axios';
import { getLocalDateString } from './dateUtils.js';

/**
 * Tải xuống danh sách khách đoàn tour BU2, BU4, BU5 theo chuẩn mẫu namelist-fittour.xlsx
 * Sử dụng API Backend để đọc trực tiếp file mẫu gốc, đảm bảo 100%:
 * 1. Giữ nguyên Logo FIT TOUR ở góc trái (ô B2:D4).
 * 2. Định dạng ngày sinh (DOB), ngày hết hạn (DOE) theo chuẩn 'd mmm yyyy;@'.
 * 3. Danh sách hành khách bắt đầu trực tiếp từ No 1 (không có dòng mẫu Team Leader).
 * 4. Bảng chuyến bay 2 chặng HAN / SGN và thống kê phòng DOUBLE / TWIN / SINGLE.
 */
export const exportBU245MembersXlsx = async ({ tour = {}, members = [], fileNamePrefix = '' }) => {
  const tourId = tour?.id;
  if (!tourId) {
    alert('Không tìm thấy thông tin tour để xuất file!');
    return;
  }

  try {
    const res = await axios.post(`/api/op-tours/${tourId}/export-bu245`, {
      members,
      bookingName: fileNamePrefix
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      responseType: 'blob'
    });

    let fileName = `Namelist_BU245_${(tour.tour_code || 'Tour').replace(/[\s\/\\]+/g, '_')}_${getLocalDateString()}.xlsx`;
    const disposition = res.headers ? res.headers['content-disposition'] : '';
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?("?[^";]+"?)/i);
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1].replace(/"/g, ''));
      }
    }

    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error('Error downloading BU245 Excel:', err);
    alert('Không thể tải xuống danh sách BU2,4,5. Vui lòng kiểm tra lại kết nối!');
  }
};
