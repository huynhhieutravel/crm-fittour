#!/bin/bash

# FIT Tour CRM - VPS Deployment Script
# Target: crm.tournuocngoai.com

PROJECT_DIR="/var/www/fittour-crm"
GIT_REPO="https://github.com/huynhhieutravel/crm-fittour.git"
DOMAIN="crm.tournuocngoai.com"

echo "🚀 Bắt đầu quá trình triển khai FIT Tour CRM..."

# 1. Tạo thư mục và cấp quyền
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 2. Clone hoặc Pull code
if [ -d ".git" ]; then
    echo "🔄 Cập nhật mã nguồn mới nhất..."
    git pull origin main
else
    echo "📥 Đang tải mã nguồn từ GitHub..."
    git clone $GIT_REPO .
fi

# 3. Cài đặt Backend
echo "📦 Đang cài đặt Backend..."
cd server
npm install
# Lưu ý: Bạn cần tạo file .env thủ công hoặc dùng các biến môi trường tại đây
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️ Đã tạo file .env từ template. Hãy nhớ cập nhật thông tin Database thực tế!"
fi

# 4. Cài đặt và Build Frontend
echo "🏗️ Đang Build Frontend..."
cd ../client
npm install
npm run build

# 5. Chạy Server với PM2
echo "⚙️ Đang khởi động Server qua PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 Đang cài đặt PM2..."
    npm install -g pm2
fi
cd ../server
pm2 delete crm-fittour 2>/dev/null || true
pm2 start index.js --name "crm-fittour" -- --port 5001

# 6. Hướng dẫn cấu hình Nginx (Vì máy có nhiều web nên không tự ý ghi đè)
echo "----------------------------------------------------"
echo "✅ Triển khai hoàn tất một phần!"
echo "📍 Thư mục dự án: $PROJECT_DIR"
echo ""
echo "🔥 BƯỚC TIẾP THEO (Cấu hình Nginx):"
echo "1. Tạo file: /etc/nginx/sites-available/$DOMAIN"
echo "2. Copy nội dung cấu hình mà tôi sẽ gửi cho bạn vào đó."
echo "3. Link file: ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
echo "4. Test & Reload: nginx -t && systemctl reload nginx"
echo "----------------------------------------------------"
