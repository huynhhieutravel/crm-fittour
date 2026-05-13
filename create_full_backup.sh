#!/bin/bash

set -e

# Đảm bảo luôn đứng ở đúng thư mục dự án
cd "/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour"

echo "=========================================================="
echo "🛡️ FIT TOUR CRM - FULL A-Z BACKUP SCRIPT"
echo "=========================================================="

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="_backups"
DB_FILE="${BACKUP_DIR}/fittour_db_production_${DATE}.sql"
ARCHIVE_NAME="${BACKUP_DIR}/FITTOUR_FULL_AZ_${DATE}.tar.gz"
VPS="root@45.76.144.188"

mkdir -p $BACKUP_DIR

echo "1/3 Đang lấy dữ liệu toàn bộ (Database) từ VPS Production..."
# Dùng SSH để chạy pg_dump và tải file sql về
ssh $VPS "su - postgres -c 'pg_dump crm_fittour > /tmp/latest_dump.sql' || su - postgres -c 'pg_dump fittour_crm > /tmp/latest_dump.sql'"
scp $VPS:/tmp/latest_dump.sql $DB_FILE

echo "✅ Đã tải xong Database: $DB_FILE"

echo "2/3 Đang nén toàn bộ Source Code & Database..."
# Nén toàn bộ thư mục, loại bỏ các file tạm hoặc node_modules để tránh quá nặng
tar -czvf $ARCHIVE_NAME \
    --exclude="node_modules" \
    --exclude="client/node_modules" \
    --exclude="server/node_modules" \
    --exclude=".git" \
    --exclude=".tmp_puppeteer" \
    --exclude=".DS_Store" \
    --exclude="client/dist" \
    --exclude="${BACKUP_DIR}/*.tar.gz" \
    .

echo "3/3 Dọn dẹp file tạm..."
ssh $VPS "rm /tmp/latest_dump.sql"

echo "=========================================================="
echo "🎉 HOÀN TẤT! File backup Full A-Z của bạn là:"
echo "📂 $ARCHIVE_NAME"
echo "💡 (Bao gồm: toàn bộ Code, cấu hình .env, và file Database production để phục hồi khi cần)"
echo "=========================================================="
