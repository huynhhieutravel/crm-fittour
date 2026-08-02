#!/bin/bash
# Script to full backup CRM FIT Tour from VPS to local _backups folder

VPS_USER="root"
VPS_IP="45.76.144.188"
VPS_PATH="/var/www/fittour-crm"
DB_NAME="fittour_crm"
DB_USER="postgres"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="_backups/backup_${TIMESTAMP}"

echo "========================================"
echo "Bắt đầu backup toàn bộ hệ thống từ VPS..."
echo "Thời gian: $TIMESTAMP"
echo "========================================"

# Tạo thư mục backup ở local
mkdir -p "$BACKUP_DIR"

echo "[1/3] Đang dump Database (PostgreSQL) trên VPS..."
ssh ${VPS_USER}@${VPS_IP} "sudo -u postgres pg_dump ${DB_NAME} > /tmp/${DB_NAME}_${TIMESTAMP}.sql"
echo "Đang tải Database dump về local..."
scp ${VPS_USER}@${VPS_IP}:/tmp/${DB_NAME}_${TIMESTAMP}.sql "$BACKUP_DIR/"
ssh ${VPS_USER}@${VPS_IP} "rm /tmp/${DB_NAME}_${TIMESTAMP}.sql"

echo "[2/3] Đang nén mã nguồn, hình ảnh và tài liệu trên VPS (bỏ qua node_modules, .git)..."
# Tạo một file tar chứa toàn bộ mã nguồn trừ những thư mục nặng không cần thiết
ssh ${VPS_USER}@${VPS_IP} "cd /var/www && tar -czf /tmp/fittour_crm_code_${TIMESTAMP}.tar.gz --exclude='fittour-crm/server/node_modules' --exclude='fittour-crm/client/node_modules' --exclude='fittour-crm/.git' fittour-crm"
echo "Đang tải mã nguồn về local..."
scp ${VPS_USER}@${VPS_IP}:/tmp/fittour_crm_code_${TIMESTAMP}.tar.gz "$BACKUP_DIR/"
ssh ${VPS_USER}@${VPS_IP} "rm /tmp/fittour_crm_code_${TIMESTAMP}.tar.gz"

echo "[3/3] Backup hoàn tất!"
echo "Dữ liệu đã được lưu tại: $(pwd)/${BACKUP_DIR}"
echo "========================================"
ls -lh "$BACKUP_DIR"
