#!/bin/bash
# ==============================================================================
# FIT TOUR CRM - TOÀN DIỆN DISASTER RECOVERY & FULL BACKUP SCRIPT
# ==============================================================================

set -e
export COPYFILE_DISABLE=1

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

VPS_USER="root"
VPS_IP="45.76.144.188"
VPS_PATH="/var/www/fittour-crm"
DB_NAME="fittour_crm"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FOLDER_NAME="FITTOUR_CRM_FULL_BACKUP_${TIMESTAMP}"
BACKUP_PATH="${PROJECT_ROOT}/_backups/${BACKUP_FOLDER_NAME}"
MASTER_ARCHIVE="${PROJECT_ROOT}/_backups/FITTOUR_CRM_MASTER_BACKUP_${TIMESTAMP}.tar"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BẮT ĐẦU FULL BACKUP TOÀN DIỆN CRM FIT TOUR                  ║"
echo "║          Thời gian: $(date '+%d/%m/%Y %H:%M:%S')                                ║"
echo "║          VPS Production: ${VPS_IP}                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Chuẩn bị thư mục chứa bản backup
mkdir -p "${BACKUP_PATH}/database"
mkdir -p "${BACKUP_PATH}/server_uploads"
mkdir -p "${BACKUP_PATH}/server_configs"
mkdir -p "${BACKUP_PATH}/source_code"

# ------------------------------------------------------------------------------
# BƯỚC 1: DUMP POSTGRESQL DATABASE TRỰC TIẾP TỪ VPS PRODUCTION
# ------------------------------------------------------------------------------
echo "📦 [1/5] Đang dump Database PostgreSQL ('${DB_NAME}') từ VPS Production..."

REMOTE_SQL_GZ="/tmp/${DB_NAME}_live_${TIMESTAMP}.sql.gz"
REMOTE_DUMP_FC="/tmp/${DB_NAME}_live_${TIMESTAMP}.dump"

ssh "${VPS_USER}@${VPS_IP}" "
  PGPASSWORD=fittour2026 pg_dump -U postgres -h 127.0.0.1 ${DB_NAME} | gzip > ${REMOTE_SQL_GZ}
  PGPASSWORD=fittour2026 pg_dump -U postgres -h 127.0.0.1 -Fc ${DB_NAME} > ${REMOTE_DUMP_FC}
"

echo "   📥 Đang tải các bản dump Database về local..."
scp "${VPS_USER}@${VPS_IP}:${REMOTE_SQL_GZ}" "${BACKUP_PATH}/database/fittour_crm_production_${TIMESTAMP}.sql.gz"
scp "${VPS_USER}@${VPS_IP}:${REMOTE_DUMP_FC}" "${BACKUP_PATH}/database/fittour_crm_production_${TIMESTAMP}.dump"

# Dọn dẹp trên VPS
ssh "${VPS_USER}@${VPS_IP}" "rm -f ${REMOTE_SQL_GZ} ${REMOTE_DUMP_FC}"
echo "   ✅ Database backup hoàn tất (gồm cả .sql.gz và .dump)."

# ------------------------------------------------------------------------------
# BƯỚC 2: TẢI TOÀN BỘ FILE UPLOADS, ẢNH, HỘ CHIẾU, PHIẾU THU TỪ SERVER
# ------------------------------------------------------------------------------
echo ""
echo "📸 [2/5] Đang nén và tải toàn bộ File Uploads từ VPS (server/public/uploads)..."
REMOTE_UPLOADS_TAR="/tmp/fittour_uploads_${TIMESTAMP}.tar.gz"

ssh "${VPS_USER}@${VPS_IP}" "
  tar -czf ${REMOTE_UPLOADS_TAR} --exclude='._*' --exclude='.DS_Store' -C ${VPS_PATH}/server/public uploads
"

echo "   📥 Đang kéo file nén Uploads (~800MB) về máy local..."
scp "${VPS_USER}@${VPS_IP}:${REMOTE_UPLOADS_TAR}" "${BACKUP_PATH}/server_uploads/server_public_uploads_${TIMESTAMP}.tar.gz"

ssh "${VPS_USER}@${VPS_IP}" "rm -f ${REMOTE_UPLOADS_TAR} /tmp/test_uploads.tar.gz"
echo "   ✅ Đã tải thành công toàn bộ ảnh/hộ chiếu/phiếu thu từ Server."

# ------------------------------------------------------------------------------
# BƯỚC 3: LẤY TOÀN BỘ CẤU HÌNH HỆ THỐNG (.env, NGINX, PM2, CRONTAB)
# ------------------------------------------------------------------------------
echo ""
echo "⚙️  [3/5] Đang thu thập các file cấu hình và biến môi trường Production..."

# .env server & root
scp "${VPS_USER}@${VPS_IP}:${VPS_PATH}/server/.env" "${BACKUP_PATH}/server_configs/server.env" 2>/dev/null || true
scp "${VPS_USER}@${VPS_IP}:${VPS_PATH}/.env" "${BACKUP_PATH}/server_configs/root.env" 2>/dev/null || true

# Token Zalo & Sandbox
scp "${VPS_USER}@${VPS_IP}:${VPS_PATH}/zalo_tokens.json" "${BACKUP_PATH}/server_configs/zalo_tokens.json" 2>/dev/null || true
scp "${VPS_USER}@${VPS_IP}:${VPS_PATH}/zalo_sandbox_messages.json" "${BACKUP_PATH}/server_configs/zalo_sandbox_messages.json" 2>/dev/null || true

# Nginx config
scp "${VPS_USER}@${VPS_IP}:/etc/nginx/sites-available/erp.fittour.vn" "${BACKUP_PATH}/server_configs/nginx_erp.fittour.vn.conf" 2>/dev/null || true
scp "${VPS_USER}@${VPS_IP}:/etc/nginx/sites-available/crm-redirect.conf" "${BACKUP_PATH}/server_configs/nginx_crm-redirect.conf" 2>/dev/null || true

# Crontab & PM2
ssh "${VPS_USER}@${VPS_IP}" "crontab -l" > "${BACKUP_PATH}/server_configs/crontab_root.txt" 2>/dev/null || true
ssh "${VPS_USER}@${VPS_IP}" "pm2 show crm-fittour" > "${BACKUP_PATH}/server_configs/pm2_crm_info.txt" 2>/dev/null || true
scp "${VPS_USER}@${VPS_IP}:/root/backup_crm.sh" "${BACKUP_PATH}/server_configs/backup_crm.sh" 2>/dev/null || true

# SSL Certificates (LetsEncrypt)
ssh "${VPS_USER}@${VPS_IP}" "tar -czf /tmp/letsencrypt_backup.tar.gz /etc/letsencrypt 2>/dev/null"
scp "${VPS_USER}@${VPS_IP}:/tmp/letsencrypt_backup.tar.gz" "${BACKUP_PATH}/server_configs/letsencrypt.tar.gz" 2>/dev/null || true
ssh "${VPS_USER}@${VPS_IP}" "rm -f /tmp/letsencrypt_backup.tar.gz"

echo "   ✅ Cấu hình Server, Nginx, SSL Certs, PM2, .env đã được lưu trữ an toàn."

# ------------------------------------------------------------------------------
# BƯỚC 4: NÉN TOÀN BỘ SOURCE CODE CHUẨN
# ------------------------------------------------------------------------------
echo ""
echo "💻 [4/5] Đang đóng gói Mã Nguồn Hệ Thống (Clean Source Code)..."
SOURCE_TAR="${BACKUP_PATH}/source_code/fittour_crm_source_${TIMESTAMP}.tar.gz"

tar -czf "${SOURCE_TAR}" \
  --exclude="node_modules" \
  --exclude="client/node_modules" \
  --exclude="server/node_modules" \
  --exclude=".git" \
  --exclude="_backups" \
  --exclude="client/dist" \
  --exclude=".DS_Store" \
  --exclude=".tmp_puppeteer" \
  --exclude="server/public/uploads" \
  --exclude="._*" \
  .

echo "   ✅ Đã đóng gói mã nguồn sạch (loại trừ node_modules/.git/uploads trùng lặp)."

# ------------------------------------------------------------------------------
# BƯỚC 5: TẠO SCRIPT PHỤC HỒI (restore.sh) VÀ TÀI LIỆU HƯỚNG DẪN
# ------------------------------------------------------------------------------
echo ""
echo "📝 [5/5] Đang tạo tài liệu hướng dẫn phục hồi và script khôi phục A-Z..."

cat << 'EOF' > "${BACKUP_PATH}/HUONG_DAN_KHOI_PHUC.md"
# 🛡️ HƯỚNG DẪN PHỤC HỒI HỆ THỐNG CRM FIT TOUR TỪ BẢN BACKUP

Tài liệu này hướng dẫn chi tiết cách khôi phục lại 100% hệ thống CRM FIT Tour từ bản backup trong trường hợp máy chủ VPS bị lỗi, bị cài lại OS, hoặc cần dựng lại trên máy chủ mới.

---

## 1. Cấu trúc gói Backup
- `database/`:
  - `fittour_crm_production_*.sql.gz`: File dump SQL PostgreSQL nén (chứa đầy đủ dữ liệu khách hàng, bookings, leads, visas, members, messages, audit logs,...).
  - `fittour_crm_production_*.dump`: File dump dạng Custom Format của PostgreSQL (dùng cho `pg_restore` tốc độ cao).
- `server_uploads/`:
  - `server_public_uploads_*.tar.gz`: Toàn bộ hình ảnh, hộ chiếu, phiếu thu, ảnh phòng khách sạn, nhà xe, vé dịch vụ,...
- `server_configs/`:
  - `server.env`: Cấu hình môi trường Production (Database URL, JWT Secret, Token Zalo/FB/Telegram, Port,...).
  - `letsencrypt.tar.gz`: Toàn bộ chứng chỉ SSL Let's Encrypt của domain Production.
  - `nginx_erp.fittour.vn.conf`: Cấu hình máy chủ web Nginx cho tên miền `erp.fittour.vn`.
  - `nginx_crm-redirect.conf`: Cấu hình redirect domain cũ.
  - `backup_crm.sh`: Script backup tự động hàng đêm tại /root/.
  - `crontab_root.txt`: Lịch chạy tác vụ tự động (Cronjob).
  - `pm2_crm_info.txt`: Thông tin tiến trình PM2.
- `source_code/`:
  - `fittour_crm_source_*.tar.gz`: Toàn bộ mã nguồn backend & frontend sạch (sẵn sàng npm install).
- `restore.sh`: Script tự động giải nén và khôi phục khi chạy trên VPS.

---

## 2. Các bước khôi phục trên VPS mới (Thực hiện tuần tự)

### Bước 2.1: Cài đặt môi trường cần thiết trên VPS (Ubuntu/Debian)
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Node.js (v20+), Git, Nginx, PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql postgresql-contrib

# Cài PM2
sudo npm install -g pm2
```

### Bước 2.2: Khôi phục Database PostgreSQL
```bash
# Tạo user và database fittour_crm
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'fittour2026';" || true
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'fittour2026';"
sudo -u postgres psql -c "CREATE DATABASE fittour_crm OWNER postgres;" || true

# Khôi phục dữ liệu từ file .sql.gz
gunzip -c database/fittour_crm_production_*.sql.gz | sudo -u postgres psql fittour_crm

# HOẶC dùng pg_restore từ file .dump:
# pg_restore -U postgres -d fittour_crm -v database/fittour_crm_production_*.dump
```

### Bước 2.3: Giải nén Mã nguồn và Uploads
```bash
# Tạo thư mục dự án
sudo mkdir -p /var/www/fittour-crm
sudo chown -R $USER:$USER /var/www/fittour-crm

# Giải nén mã nguồn
tar -xzf source_code/fittour_crm_source_*.tar.gz -C /var/www/fittour-crm

# Giải nén thư mục uploads (ảnh, hộ chiếu, phiếu thu)
tar -xzf server_uploads/server_public_uploads_*.tar.gz -C /var/www/fittour-crm/server/public/

# Copy file .env và token
cp server_configs/server.env /var/www/fittour-crm/server/.env
cp server_configs/zalo_*.json /var/www/fittour-crm/ 2>/dev/null || true
```

### Bước 2.4: Cài đặt Dependencies & Build Frontend
```bash
cd /var/www/fittour-crm

# Cài dependencies server
cd server && npm install && cd ..

# Cài dependencies client & build
cd client && npm install && npm run build && cd ..

# Tạo symlink uploads cho client dist
ln -sfn /var/www/fittour-crm/server/public/uploads /var/www/fittour-crm/client/dist/uploads
```

### Bước 2.5: Cấu hình Phân quyền Nginx & Static files
```bash
# Phân quyền cho Nginx truy cập uploads và dist
sudo chown -R www-data:www-data /var/www/fittour-crm/client
sudo chmod -R 755 /var/www/fittour-crm/client

sudo chown -R www-data:www-data /var/www/fittour-crm/server
sudo find /var/www/fittour-crm/server -type d -exec chmod 755 {} \;
sudo find /var/www/fittour-crm/server -type f -exec chmod 644 {} \;
```

### Bước 2.6: Cấu hình Nginx
```bash
sudo cp server_configs/nginx_erp.fittour.vn.conf /etc/nginx/sites-available/erp.fittour.vn
sudo ln -sf /etc/nginx/sites-available/erp.fittour.vn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Bước 2.7: Khởi chạy Backend với PM2
```bash
cd /var/www/fittour-crm/server
pm2 start index.js --name "crm-fittour"
pm2 save
pm2 startup
```

---

## 3. Khôi phục Tự Động Bằng Script (Khuyên Dùng)
Nếu bạn đã tải thư mục backup lên VPS mới, chỉ cần đứng tại thư mục backup và chạy:
```bash
sudo bash restore.sh
```
Script sẽ tự động chạy toàn bộ các bước từ 1 đến 7!
EOF

cat << 'EOF' > "${BACKUP_PATH}/restore.sh"
#!/bin/bash
# Script tự động khôi phục nhanh hệ thống từ thư mục backup này
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="/var/www/fittour-crm"

echo "=========================================================="
echo "🛡️ BẮT ĐẦU KHÔI PHỤC CRM FIT TOUR TỰ ĐỘNG"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Vui lòng chạy với quyền root (sudo bash restore.sh)"
  exit 1
fi

echo "1. Khôi phục Database PostgreSQL..."
su - postgres -c "psql -c 'CREATE DATABASE fittour_crm;'" 2>/dev/null || true
SQL_GZ=$(ls ${DIR}/database/*.sql.gz | head -n 1)
if [ -f "$SQL_GZ" ]; then
  echo "   Đang nạp file: $SQL_GZ"
  gunzip -c "$SQL_GZ" | su - postgres -c "psql fittour_crm"
fi

echo "2. Khôi phục Mã nguồn..."
mkdir -p "$TARGET_DIR"
SOURCE_TAR=$(ls ${DIR}/source_code/*.tar.gz | head -n 1)
tar -xzf "$SOURCE_TAR" -C "$TARGET_DIR"

echo "3. Khôi phục File Uploads (Hộ chiếu, Ảnh, Phiếu thu)..."
UPLOADS_TAR=$(ls ${DIR}/server_uploads/*.tar.gz | head -n 1)
mkdir -p "${TARGET_DIR}/server/public"
tar -xzf "$UPLOADS_TAR" -C "${TARGET_DIR}/server/public"

echo "4. Khôi phục file cấu hình .env, Nginx và SSL..."
cp ${DIR}/server_configs/server.env "${TARGET_DIR}/server/.env"
cp ${DIR}/server_configs/zalo_*.json "${TARGET_DIR}/" 2>/dev/null || true
if [ -f "${DIR}/server_configs/letsencrypt.tar.gz" ]; then
  tar -xzf "${DIR}/server_configs/letsencrypt.tar.gz" -C /
fi
if [ -f "${DIR}/server_configs/nginx_erp.fittour.vn.conf" ]; then
  cp "${DIR}/server_configs/nginx_erp.fittour.vn.conf" /etc/nginx/sites-available/erp.fittour.vn
  ln -sf /etc/nginx/sites-available/erp.fittour.vn /etc/nginx/sites-enabled/
fi
if [ -f "${DIR}/server_configs/backup_crm.sh" ]; then
  cp "${DIR}/server_configs/backup_crm.sh" /root/backup_crm.sh
  chmod +x /root/backup_crm.sh
fi

echo "5. Cài đặt dependencies và Build..."
cd "${TARGET_DIR}/server" && npm install --production
cd "${TARGET_DIR}/client" && npm install && npm run build
ln -sfn "${TARGET_DIR}/server/public/uploads" "${TARGET_DIR}/client/dist/uploads"

echo "6. Phân quyền www-data..."
chown -R www-data:www-data "${TARGET_DIR}/client"
chmod -R 755 "${TARGET_DIR}/client"
chown -R www-data:www-data "${TARGET_DIR}/server"
find "${TARGET_DIR}/server" -type d -exec chmod 755 {} \;
find "${TARGET_DIR}/server" -type f -exec chmod 644 {} \;

echo "7. Khởi động PM2..."
cd "${TARGET_DIR}/server"
pm2 restart crm-fittour || pm2 start index.js --name "crm-fittour"
pm2 save

echo "=========================================================="
echo "🎉 KHÔI PHỤC HOÀN TẤT THÀNH CÔNG!"
echo "=========================================================="
EOF
chmod +x "${BACKUP_PATH}/restore.sh"

# ------------------------------------------------------------------------------
# BƯỚC 6: TẠO FILE NÉN TỔNG HỢP (MASTER ARCHIVE) ĐỂ NGƯỜI DÙNG TIỆN TẢI VỀ
# ------------------------------------------------------------------------------
echo ""
echo "📦 Đang tạo file Master Archive duy nhất để bạn dễ dàng lưu trữ..."
# Gom toàn bộ folder backup vào 1 file tar duy nhất (không nén lại vì bên trong đã nén gz, giúp hoàn thành cực nhanh)
tar -cf "${MASTER_ARCHIVE}" -C "${PROJECT_ROOT}/_backups" "${BACKUP_FOLDER_NAME}"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🎉 FULL BACKUP TOÀN DIỆN THÀNH CÔNG!                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Thư mục backup chi tiết:"
echo "   📍 ${BACKUP_PATH}"
echo ""
echo "📦 File tổng hợp duy nhất (để bạn tải về máy/drive lưu trữ an toàn):"
echo "   📍 ${MASTER_ARCHIVE}"
echo ""
echo "📊 Dung lượng các thành phần:"
du -sh "${BACKUP_PATH}/database" "${BACKUP_PATH}/server_uploads" "${BACKUP_PATH}/server_configs" "${BACKUP_PATH}/source_code" "${MASTER_ARCHIVE}"
echo ""
