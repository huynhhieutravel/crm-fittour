#!/bin/bash

# FIT Tour CRM - VPS Deployment Script
# Target: crm.tournuocngoai.com

PROJECT_DIR="/var/www/fittour-crm"
DOMAIN="crm.tournuocngoai.com"

echo "🚀 Bắt đầu quá trình triển khai FIT Tour CRM..."

# 1. Di chuyển vào thư mục dự án
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Không tìm thấy thư mục dự án tại $PROJECT_DIR"
    exit 1
fi
cd $PROJECT_DIR

# 2. Pull code mới nhất
echo "🔄 Cập nhật mã nguồn từ GitHub..."
git pull origin main

# 3. Cài đặt và cập nhật Backend
echo "📦 Đang cập nhật Backend..."
cd server
npm install

# 4. Sao lưu và Cập nhật cấu trúc Database
echo "🗄️ Đang sao lưu Database..."
mkdir -p ../backups
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    pg_dump "$DATABASE_URL" -f "../backups/db_backup_$(date +%Y%m%d_%H%M%S).sql" || echo "⚠️ Lỗi khi sao lưu, tiếp tục triển khai..."
else
    echo "⚠️ Không tìm thấy file .env để lấy cấu hình kết nối Database!"
fi

echo "⚡ Đang đồng bộ cấu trúc Database (Universal Sync)..."
node sync_database.js

# 5. Cài đặt và Build Frontend
echo "🏗️ Đang Build Frontend..."
cd ../client
npm install
npm run build

# 6. Khởi động lại Server với PM2
echo "⚙️ Đang khởi động lại dịch vụ..."
cd ../server
pm2 restart crm-fittour || pm2 start index.js --name "crm-fittour" -- --port 5001

echo "----------------------------------------------------"
echo "✅ Triển khai hoàn tất!"
echo "📍 Domain: $DOMAIN"
echo "🕒 Thời gian: $(date)"
echo "----------------------------------------------------"
