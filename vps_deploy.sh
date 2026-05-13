#!/bin/bash

# ================================================================
# FIT Tour CRM - VPS Deployment Script
# Target: erp.fittour.vn
# 
# ⚠️ QUAN TRỌNG: Script này BẮT BUỘC chạy bước FIX PERMISSIONS
# sau mỗi lần build/deploy. KHÔNG ĐƯỢC BỎ QUA hoặc SỬA XÓA bước này.
# Thiếu bước này = 403 Forbidden (đã xảy ra NHIỀU LẦN).
# ================================================================

set -e  # Dừng ngay khi có lỗi

PROJECT_DIR="/var/www/fittour-crm"
DOMAIN="erp.fittour.vn"
WEB_USER="www-data"
WEB_GROUP="www-data"

echo "=============================================="
echo "🚀 FIT Tour CRM — Bắt đầu triển khai"
echo "🕒 $(date)"
echo "=============================================="

# 1. Kiểm tra thư mục dự án
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Không tìm thấy thư mục dự án tại $PROJECT_DIR"
    exit 1
fi
cd $PROJECT_DIR

# 2. Pull code mới nhất
echo ""
echo "📥 [BƯỚC 1/7] Cập nhật mã nguồn từ GitHub..."
git pull origin main

# 3. Cài đặt Backend dependencies
echo ""
echo "📦 [BƯỚC 2/7] Cập nhật Backend dependencies..."
cd server
npm install --production

# 4. Sao lưu Database
echo ""
echo "🗄️ [BƯỚC 3/7] Sao lưu Database..."
mkdir -p ../backups
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    pg_dump "$DATABASE_URL" -f "../backups/db_backup_$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null || echo "⚠️ Lỗi sao lưu DB, tiếp tục..."
else
    echo "⚠️ Không tìm thấy .env, bỏ qua sao lưu DB"
fi

# 5. Đồng bộ Database schema
echo ""
echo "⚡ [BƯỚC 4/7] Đồng bộ cấu trúc Database..."
node sync_database.js 2>/dev/null || echo "⚠️ sync_database.js không tồn tại hoặc lỗi, bỏ qua"

# 6. Build Frontend
echo ""
echo "🏗️ [BƯỚC 5/7] Build Frontend..."
cd ../client
npm install
npm run build

# ================================================================
# 🔐 BƯỚC 6/7: FIX PERMISSIONS — BẮT BUỘC, KHÔNG ĐƯỢC BỎ QUA
# ================================================================
# Lý do: rsync/git từ macOS tạo file với owner 501:staff + mode 700
# Nginx chạy dưới www-data → không đọc được → 403 Forbidden
# ĐÃ GÂY LỖI PRODUCTION NHIỀU LẦN. TUYỆT ĐỐI KHÔNG XÓA BƯỚC NÀY.
# ================================================================
echo ""
echo "🔐 [BƯỚC 6/7] FIX PERMISSIONS (BẮT BUỘC)..."
cd $PROJECT_DIR
chown -R ${WEB_USER}:${WEB_GROUP} client/dist/
chmod -R 755 client/dist/
chown -R ${WEB_USER}:${WEB_GROUP} server/
chmod -R 755 server/
echo "   ✅ client/dist/ → ${WEB_USER}:${WEB_GROUP} (755)"
echo "   ✅ server/      → ${WEB_USER}:${WEB_GROUP} (755)"

# Tạo Symlink cho thư mục uploads để Nginx có thể đọc được ảnh Avatar / Receipts
echo "   🔗 Tạo symlink cho thư mục uploads..."
ln -sfn /var/www/fittour-crm/server/public/uploads /var/www/fittour-crm/client/dist/uploads
chown -h ${WEB_USER}:${WEB_GROUP} /var/www/fittour-crm/client/dist/uploads
echo "   ✅ Symlink uploads đã được tạo."

# Verify permissions are correct
DIST_OWNER=$(stat -c '%U' client/dist/index.html 2>/dev/null || stat -f '%Su' client/dist/index.html 2>/dev/null)
if [ "$DIST_OWNER" != "$WEB_USER" ]; then
    echo "❌ CRITICAL: Permission fix FAILED! dist/index.html owner = $DIST_OWNER (expected $WEB_USER)"
    echo "❌ Website sẽ bị 403 Forbidden! Kiểm tra lại ngay."
    exit 1
fi
echo "   ✅ Verified: index.html owner = $DIST_OWNER"

# 7. Restart PM2
echo ""
echo "⚙️ [BƯỚC 7/7] Khởi động lại PM2..."
cd server
pm2 restart crm-fittour || pm2 start index.js --name "crm-fittour" -- --port 5001
sleep 3

# Post-deploy verification
echo ""
echo "🔍 POST-DEPLOY VERIFICATION..."
PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ "$PM2_STATUS" = "online" ]; then
    echo "   ✅ PM2 status: online"
else
    echo "   ⚠️ PM2 status: $PM2_STATUS (kiểm tra pm2 logs)"
fi

# Smoke test
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ HTTPS smoke test: $HTTP_CODE OK"
else
    echo "   ⚠️ HTTPS smoke test: $HTTP_CODE (kiểm tra Nginx/Cloudflare)"
fi

echo ""
echo "=============================================="
echo "✅ Triển khai hoàn tất!"
echo "📍 Domain: https://$DOMAIN"
echo "🕒 $(date)"
echo "=============================================="
