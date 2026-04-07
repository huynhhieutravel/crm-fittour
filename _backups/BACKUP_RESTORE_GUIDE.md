# 🚀 HƯỚNG DẪN SAO LƯU & KHÔI PHỤC (BACKUP & RESTORE) CRM FITTOUR

Tài liệu này hướng dẫn cách sao lưu toàn bộ hệ thống (Source Code + Database) và cách khôi phục lại khi Server gặp sự cố.

---

## PHẦN 1: TẠO BẢN SAO LƯU KẾT HỢP (MỚI NHẤT)

Đây là quy trình chuẩn để gom toàn bộ dữ liệu máy chủ và code thành 1 cục ZIP duy nhất.

### Bước 1: Trích xuất Dữ liệu (Database) từ VPS về máy tính
Mở Terminal / iTerm (trên Macbook) và chạy lần lượt 2 lệnh sau:

1. SSH vào VPS và nhờ Docker xuất file SQL (Dữ liệu):
```bash
ssh root@64.176.85.168 'docker exec vstep-postgres pg_dump -U postgres fittour_crm > /var/www/fittour-crm/fittour_crm_backup.sql'
```

2. Tải file `fittour_crm_backup.sql` từ VPS đó về thư mục Code ở máy tính hiện tại:
```bash
scp root@64.176.85.168:/var/www/fittour-crm/fittour_crm_backup.sql ./fittour_crm_production_backup_$(date +%Y-%m-%d).sql
```

### Bước 2: Nén Code và SQL thành 1 File `.zip`
Chạy lệnh này trên Terminal (vẫn đang đứng ở thư mục dự án `crm-fittour`):

```bash
zip -r fittour_crm_full_backup_$(date +%Y%m%d).zip . -x "*/node_modules/*" -x "*/.git/*" -x "client/dist/*" -x "*/.DS_Store" -x "*.zip"
```

✅ **Kết Quả:** Bạn sẽ có 1 file `.zip` tên dạng `fittour_crm_full_backup_2026xxxx.zip` (Tầm 72MB). 
👉 Dùng file này để up lên Google Drive. Tất cả Code, file ENV, và SQL đều nằm gọn ở trong đó!

---

## PHẦN 2: HƯỚNG DẪN KHÔI PHỤC (RESTORE) HỆ THỐNG Y HỆT BAN ĐẦU

Nếu Server gặp trục trặc không thể cứu vãn, bạn chỉ cần tải file `.zip` đó từ Google Drive về, giải nén ra và làm theo 2 bước sau:

### Lựa chọn 1: Dựng lại Localhost (Trên Macbook của bạn)

1. **Khôi phục Code:**
   Bật Terminal, trỏ vào thư mục vừa giải nén, cài lại các thư viện (`node_modules`) vì file zip đã loại bỏ chúng để giảm dung lượng:
   ```bash
   npm install            # Cài thư viện cho Root
   cd client && npm install  # Cài thư viện cho Frontend
   cd ../server && npm install  # Cài thư viện cho Backend
   ```

2. **Khôi phục Cơ sở dữ liệu (Database):**
   Tìm file `.sql` có sẵn trong cục zip vừa bung ra, mở công cụ quản lý DB (như **DBeaver** hoặc **TablePlus**). Tạo Database mới tên `fittour_crm` sau đó chọn **Import** / **Restore** và trỏ đường dẫn tới file SQL này. Code sẽ tự động nhận diện.

### Lựa chọn 2: Up Server mới / Khôi phục Production
Quy trình sẽ bao gồm Rsync đẩy code lên lại VPS và dùng chức năng Import DB của Postgres trên Server:

1. Đẩy Code lên lại server:
```bash
rsync -avz --progress --exclude='node_modules' --exclude='.env' ./ root@64.176.85.168:/var/www/fittour-crm/
```

2. Up Database lên lại Server và dùng Docker khôi phục:
```bash
# Bỏ file SQL lên VPS 
scp ./fittour_crm_production_backup_2026-04-06.sql root@64.176.85.168:/root/

# Nhờ Container Docker khôi phục vào hệ thống
ssh root@64.176.85.168
cat /root/fittour_crm_production_backup_2026-04-06.sql | docker exec -i vstep-postgres psql -U postgres -d fittour_crm
```

💯 **Như vậy hệ thống của bạn đã được hồi sinh nguyên dạng, không suy suyển một li nào!** Giữ kĩ file ZIP trên Drive là an toàn tuyệt đối.
