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

# 4. Chạy các bản cập nhật Database (Migrations)
echo "🗄️ Đang cập nhật cấu trúc Database..."
node migration_phase10.js
node migration_phase11.js
node migration_phase12.js

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
