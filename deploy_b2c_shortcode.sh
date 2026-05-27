#!/bin/bash
set -e

echo "═══════════════════════════════════════════"
echo "  DEPLOY B2C API & ASTRO SHORTCODE"
echo "═══════════════════════════════════════════"

VPS="root@45.76.144.188"
REMOTE="/var/www/fittour-crm"

# 1. Bắn file Backend qua VPS (Chỉ bắn đúng 1 file an toàn)
echo "1/3 Đang Rsync Backend (opTourController) sang VPS..."
rsync -avz --no-perms --no-owner --no-group server/controllers/opTourController.js $VPS:$REMOTE/server/controllers/opTourController.js

# 2. Fix permissions & Restart PM2
echo "2/3 Đang fix quyền và Restart PM2..."
ssh $VPS '
  chown www-data:www-data /var/www/fittour-crm/server/controllers/opTourController.js
  chmod 644 /var/www/fittour-crm/server/controllers/opTourController.js
  pm2 restart crm-fittour && pm2 logs crm-fittour --lines 5 --nostream
'

# 3. Build & Deploy Astro Frontend
echo "3/3 Đang Build & Deploy Astro Frontend lên Cloudflare..."
cd "../dulichcoguu-check-cai-tien-website/dulichcoguu-frontend"
npm run build
npx wrangler deploy

echo ""
echo "✅ DEPLOY THÀNH CÔNG BẢNG LỊCH KHỞI HÀNH B2C!"
echo "═══════════════════════════════════════════"
