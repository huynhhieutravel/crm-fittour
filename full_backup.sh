#!/bin/bash
# ============================================================
# FULL BACKUP SCRIPT — CRM FIT TOUR
# VPS: 45.76.144.188 (NEW VPS)
# ============================================================

set -e

VPS="root@45.76.144.188"
REMOTE_PATH="/var/www/fittour-crm"
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="$PROJECT_ROOT/_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="fittour_crm_full_backup_$TIMESTAMP"
REMOTE_TMP="/tmp/$BACKUP_NAME"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║        🚀 FULL BACKUP CRM FIT TOUR             ║"
echo "║           IP: 45.76.144.188                     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

mkdir -p "$BACKUP_DIR"

echo "📦 [1/4] Dumping PostgreSQL Database trên VPS..."
ssh "$VPS" "
  DB_URL=\$(grep DATABASE_URL $REMOTE_PATH/server/.env | cut -d '=' -f2-)
  pg_dump \$DB_URL > $REMOTE_PATH/database_backup.sql
"
echo "✅ Export database thành công."

echo ""
echo "🗜️  [2/4] Nén toàn bộ Code, DB và Tài liệu hình ảnh (uploads)..."
ssh "$VPS" "
  cd /var/www
  tar -czf $REMOTE_TMP.tar.gz fittour-crm
  rm $REMOTE_PATH/database_backup.sql
"
echo "✅ Đã nén thành công $REMOTE_TMP.tar.gz."

echo ""
echo "📥 [3/4] Tải file backup về máy local (_backups/)..."
scp "$VPS:$REMOTE_TMP.tar.gz" "$BACKUP_DIR/"
echo "✅ Đã tải file về thành công!"

echo ""
echo "🧹 [4/4] Dọn dẹp file tạm trên VPS..."
ssh "$VPS" "
  rm -f $REMOTE_TMP.tar.gz
"
echo "✅ Hoàn tất!"

echo ""
echo "🎉 BACKUP TOÀN BỘ THÀNH CÔNG!"
echo "📍 File của bạn ở: _backups/${BACKUP_NAME}.tar.gz"
echo ""
