#!/bin/bash

# ==============================================================================
# SCRIPT DEPLOY VPS AN TOÀN (CẤM RSYNC THÔ)
# Script này được thiết kế để thay thế hoàn toàn rsync thô.
# Đảm bảo:
# 1. KHÔNG BAO GIỜ chép đè .env lên Production.
# 2. Tự động cấp quyền chown cho Nginx để sửa lỗi 500/403.
# ==============================================================================

VPS_USER="root"
VPS_IP="45.76.144.188"
VPS_PATH="/var/www/fittour-crm"

echo "🚀 Bắt đầu Deploy Lên VPS ($VPS_IP)..."

# 1. Deploy Backend (Thư mục server)
echo "📦 Đang đẩy thư mục 'server'..."
rsync -avz --exclude '.env' --exclude 'node_modules' --exclude '.DS_Store' server/ ${VPS_USER}@${VPS_IP}:${VPS_PATH}/server/

# 2. Deploy Frontend (Thư mục client)
# Nếu có thư mục client thì mới rsync
if [ -d "client" ]; then
    echo "📦 Đang đẩy thư mục 'client'..."
    rsync -avz --exclude '.env' --exclude 'node_modules' --exclude '.DS_Store' client/ ${VPS_USER}@${VPS_IP}:${VPS_PATH}/client/
fi

# 3. Chạy lệnh phân quyền (Fix lỗi Nginx 500 & 403)
echo "🔒 Đang thiết lập quyền sở hữu Nginx (www-data)..."
ssh ${VPS_USER}@${VPS_IP} << 'EOF'
    echo "Phân quyền cho thư mục server..."
    chown -R www-data:www-data /var/www/fittour-crm/server
    find /var/www/fittour-crm/server -type d -exec chmod 755 {} \;
    find /var/www/fittour-crm/server -type f -exec chmod 644 {} \;

    if [ -d "/var/www/fittour-crm/client" ]; then
        echo "Phân quyền cho thư mục client..."
        chown -R www-data:www-data /var/www/fittour-crm/client
        chmod -R 755 /var/www/fittour-crm/client
    fi

    echo "✅ Phân quyền hoàn tất!"
    
    echo "🔄 Khởi động lại PM2..."
    # Không dùng --update-env mặc định trừ khi người dùng cố tình cập nhật env
    pm2 restart crm-fittour
EOF

echo "🎉 DEPLOY THÀNH CÔNG!"
