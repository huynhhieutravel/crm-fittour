# Workflow: Import Facebook Ads Marketing Weekly

**Description**:
Workflow này dùng để tự động hoá việc Upload và phân luồng BU cho Báo cáo Facebook Ads hằng tuần vào hệ thống Live CRM (Production VPS).

## Context Server
- VPS: `45.76.144.188`
- Backend Path trên VPS: `/var/www/fittour-crm/server`
- Data Path trên VPS: `/var/www/fittour-crm/data_import/bao-cao-facebook-ads`

---

## 🛠 Hướng dẫn thực thi (Dành cho Agent)

### BƯỚC 1: Xác thực Local File
Hỏi user đã lưu file template Excel vào đường dẫn local chưa: 
`[Workspace]/data_import/bao-cao-facebook-ads/{tên-file}.xlsx`
Xác nhận được tuần, tháng, năm của file từ user (để gắn biến).

### BƯỚC 2: Tạo Automation Script (chạy một lần bên Server)
Tạo script (vd `server/vps_import_ads.js`) CHỨA LOGIC SAU:
1. Load `dotenv` sử dụng `process.env.DATABASE_URL` kết nối Postgres.
2. Dùng thư viện `xlsx` đọc file xlsx vừa được cung cấp.
3. Chạy lệnh: `DELETE FROM marketing_ads_reports WHERE year = X AND month = Y AND week_number = Z` (với XYZ lấy theo biến file). Đây là thao tác Safety giúp xoá chèn nếu bị chạy lặp.
4. Quét từng dòng dữ liệu: map tên chiến dịch / Adset để trích xuất `BU`.
    - **BU1**: Trung Quốc, Bắc Kinh, Thượng Hải, Á Đinh, Giang Nam, Tân Cương, Tây Tạng, Lệ Giang...
    - **BU2**: Nam Mỹ, Châu Âu, Alaska, Úc, Mỹ, Canada...
    - **BU3**: Nhật Bản, Hàn Quốc, Đài Loan...
    - **BU4**: Bali, Bhutan, Ladakh, Bromo, Kashmir, Mông Cổ, Ấn Độ...
5. Vòng lặp `INSERT INTO marketing_ads_reports (bu_name, year, month, week_number, campaign_name, ad_set_name, ad_name, spend, messages, leads, cpl_msg, cpl_lead)...`. Ignore các dòng không chi tiêu.
6. Print log số dòng thành công.

*Lưu ý: Không thực thi script bằng Node ở Local, vì Node ở Local sẽ map vào Database Local (`fittour_local`) chứ không vào Production!!!*

### BƯỚC 3: Rsync Data và Script lên VPS PRODUCTION
Code mẫu Bash:
```bash
# Sửa lại thành tên đúng
FILE_NAME="tuanX-thangY-namZ.xlsx"

rsync -avz "data_import/bao-cao-facebook-ads/$FILE_NAME" root@45.76.144.188:/var/www/fittour-crm/data_import/bao-cao-facebook-ads/
rsync -avz "server/vps_import_ads.js" root@45.76.144.188:/var/www/fittour-crm/server/
```

### BƯỚC 4: Execute trên Production
Kích hoạt ssh và thực thi node bên trong VPS:
```bash
ssh root@45.76.144.188 "cd /var/www/fittour-crm/server && node vps_import_ads.js"
```

### Bước 5: Verify & Report
Đọc log output của Bash lệnh trên và báo cho user "Nhiệm vụ hoàn tất, dữ liệu đã đi thẳng vào Live System". Nhắc user tải lại trang.
