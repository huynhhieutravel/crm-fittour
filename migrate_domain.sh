#!/bin/bash
# ================================================================
# FIT Tour CRM — Domain Migration Script
# FROM: crm.tournuocngoai.com → TO: erp.fittour.vn
# 
# ⚠️ CHẠY SCRIPT NÀY TRÊN VPS (root@45.76.144.188)
# ⚠️ TRƯỚC KHI CHẠY: DNS erp.fittour.vn phải đã trỏ về 45.76.144.188
# ================================================================

set -e

echo "=============================================="
echo "🔄 FIT Tour CRM — Domain Migration"
echo "   crm.tournuocngoai.com → erp.fittour.vn"
echo "🕒 $(date)"
echo "=============================================="

# ─── BƯỚC 1: Backup Nginx config hiện tại ───
echo ""
echo "📋 [1/6] Backup Nginx config hiện tại..."
NGINX_CONF=""
if [ -f /etc/nginx/sites-available/fittour-crm ]; then
    NGINX_CONF="/etc/nginx/sites-available/fittour-crm"
elif [ -f /etc/nginx/sites-available/default ]; then
    NGINX_CONF="/etc/nginx/sites-available/default"
else
    # Tìm file config chứa domain hiện tại
    NGINX_CONF=$(grep -rl "crm.tournuocngoai.com" /etc/nginx/sites-available/ 2>/dev/null | head -1)
    if [ -z "$NGINX_CONF" ]; then
        NGINX_CONF=$(grep -rl "crm.tournuocngoai.com" /etc/nginx/conf.d/ 2>/dev/null | head -1)
    fi
fi

if [ -z "$NGINX_CONF" ]; then
    echo "⚠️  Không tìm thấy Nginx config! Đang kiểm tra..."
    echo "--- sites-available ---"
    ls -la /etc/nginx/sites-available/ 2>/dev/null
    echo "--- conf.d ---"
    ls -la /etc/nginx/conf.d/ 2>/dev/null
    echo ""
    echo "❌ Cần xác định file config thủ công. Dừng script."
    exit 1
fi

echo "   📄 Tìm thấy config: $NGINX_CONF"
cp "$NGINX_CONF" "${NGINX_CONF}.backup_$(date +%Y%m%d_%H%M%S)"
echo "   ✅ Đã backup"

# ─── BƯỚC 2: Hiển thị Nginx config hiện tại ───
echo ""
echo "📋 [2/6] Nginx config hiện tại:"
echo "────────────────────────────────"
cat "$NGINX_CONF"
echo ""
echo "────────────────────────────────"

# ─── BƯỚC 3: Cập nhật server_name ───
echo ""
echo "🔧 [3/6] Cập nhật Nginx server_name..."

# Thêm erp.fittour.vn vào server_name (giữ domain cũ)
# Thay crm.tournuocngoai.com → erp.fittour.vn crm.tournuocngoai.com
sed -i 's/server_name\s\+crm\.tournuocngoai\.com/server_name erp.fittour.vn crm.tournuocngoai.com/g' "$NGINX_CONF"

echo "   ✅ Đã thêm erp.fittour.vn vào server_name"
echo ""
echo "📋 Nginx config SAU khi sửa:"
echo "────────────────────────────────"
cat "$NGINX_CONF"
echo ""
echo "────────────────────────────────"

# ─── BƯỚC 4: Test Nginx config ───
echo ""
echo "🔍 [4/6] Kiểm tra Nginx config..."
nginx -t
echo "   ✅ Nginx config OK"

# ─── BƯỚC 5: Reload Nginx ───
echo ""
echo "🔄 [5/6] Reload Nginx..."
systemctl reload nginx
echo "   ✅ Nginx reloaded"

# ─── BƯỚC 6: Verify ───
echo ""
echo "🔍 [6/6] Verify..."
echo "   DNS check:"
dig +short erp.fittour.vn || echo "   ⚠️ dig không khả dụng"
echo ""
echo "   Nginx status:"
systemctl status nginx --no-pager -l | head -5

echo ""
echo "=============================================="
echo "✅ Nginx đã cập nhật!"
echo ""
echo "📌 BƯỚC TIẾP THEO (THỦ CÔNG):"
echo "   1. Pull code mới: cd /var/www/fittour-crm && git pull origin main"
echo "   2. Build frontend: cd client && npm run build"
echo "   3. Fix permissions: chown -R www-data:www-data /var/www/fittour-crm/client/dist/"
echo "   4. Sửa .env: nano /var/www/fittour-crm/server/.env"
echo "      → GOOGLE_REDIRECT_URI=https://erp.fittour.vn/api/google/callback"
echo "   5. Restart PM2: pm2 restart crm-fittour"
echo "=============================================="
