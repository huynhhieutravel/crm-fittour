require('dotenv').config();
const db = require('../server/db');

async function run() {
  const template = [
    {
        group: "A - Hồ Sơ Công Ty",
        subgroup: "",
        items: [
            { name: "GPKD (kèm GP hoạt động nếu có)", status: "Chờ bổ sung", file_link: "" },
            { name: "File Sao y công chứng GPKD", status: "Chờ bổ sung", file_link: "" },
            { name: "Giấy nộp tiền ngân sách + Báo cáo Thuế GTGT 3 tháng gần nhất", status: "Chờ bổ sung", file_link: "" }
        ]
    },
    {
        group: "B.1 Hồ Sơ Cá Nhân: Giấy Tờ Tùy Thân",
        subgroup: "",
        items: [
            { name: "Hộ chiếu mới (có ký tên trang 3)", status: "Chờ bổ sung", file_link: "" },
            { name: "Hộ chiếu cũ (nếu có)", status: "Chờ bổ sung", file_link: "" },
            { name: "CCCD (Sao y công chứng 1 mặt A4)", status: "Chờ bổ sung", file_link: "" },
            { name: "Xác nhận cư trú mẫu CT07 / Sổ hộ khẩu", status: "Chờ bổ sung", file_link: "" },
            { name: "2 ảnh thẻ vật lý + File hình thẻ (3.5 x 4.5)", status: "Chờ bổ sung", file_link: "" },
            { name: "Giấy chứng nhận kết hôn / ly hôn", status: "Chờ bổ sung", file_link: "" },
            { name: "Giấy khai sinh (đối với trẻ em)", status: "Chờ bổ sung", file_link: "" },
            { name: "Giấy đồng ý cho ba/mẹ dẫn con đi du lịch", status: "Chờ bổ sung", file_link: "" },
            { name: "Thông tin khai form (theo mẫu)", status: "Chờ bổ sung", file_link: "" }
        ]
    },
    {
        group: "B.2 Hồ Sơ Cá Nhân: Giấy Tờ Công Việc",
        subgroup: "",
        items: [
            { name: "Chủ doanh nghiệp: Đăng ký kinh doanh, Thuế", status: "Chờ bổ sung", file_link: "" },
            { name: "Nhân viên: Hợp đồng lao động, Đơn xin phép, Bảng lương", status: "Chờ bổ sung", file_link: "" },
            { name: "Hưu trí: Quyết định nghỉ hưu, Sổ hưu", status: "Chờ bổ sung", file_link: "" },
            { name: "Học sinh/Sinh viên: Thẻ HS/SV, Giấy xin phép trường", status: "Chờ bổ sung", file_link: "" },
            { name: "Lao động tự do: Giấy xác nhận công việc, Hình ảnh minh chứng", status: "Chờ bổ sung", file_link: "" }
        ]
    },
    {
        group: "C - Hồ Sơ Tài Chính Cá Nhân",
        subgroup: "",
        items: [
            { name: "Sao kê tài khoản cá nhân 4-6 tháng gần nhất", status: "Chờ bổ sung", file_link: "" },
            { name: "Xác nhận số dư sổ tiết kiệm", status: "Chờ bổ sung", file_link: "" },
            { name: "Sao kê tài khoản công ty (nếu là chủ DN)", status: "Chờ bổ sung", file_link: "" },
            { name: "Tài sản: Nhà đất, Cavet ô tô (Sao y công chứng)", status: "Chờ bổ sung", file_link: "" },
            { name: "Hợp đồng thuê nhà/xưởng/xe (nếu có)", status: "Chờ bổ sung", file_link: "" },
            { name: "Chứng khoán, cổ phần, tiền gửi sinh lời", status: "Chờ bổ sung", file_link: "" }
        ]
    },
    {
        group: "D - Hồ Sơ Người Mời (Nếu có)",
        subgroup: "",
        items: [
            { name: "Thư mời", status: "Chờ bổ sung", file_link: "" },
            { name: "Mặt hộ chiếu người mời", status: "Chờ bổ sung", file_link: "" },
            { name: "Chứng minh mối quan hệ & Hình ảnh chụp chung", status: "Chờ bổ sung", file_link: "" }
        ]
    }
  ];
  
  await db.query("UPDATE settings SET value = $1 WHERE key = 'visa_checklist_template'", [JSON.stringify(template)]);
  console.log('done');
  process.exit(0);
}
run();
