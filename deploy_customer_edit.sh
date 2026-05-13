#!/bin/bash
set -e

echo "═══════════════════════════════════════════"
echo "  DEPLOY CUSTOMER EDIT PERMISSIONS LÊN VPS MỚI (45.76.144.188)"
echo "═══════════════════════════════════════════"

VPS="root@45.76.144.188"
REMOTE="/var/www/fittour-crm"

# 1. Build frontend ở Local
echo "1/4 Đang Build React..."
cd client
npm run build
cd ..

# 2. Bắn file qua VPS bằng Rsync
echo "2/4 Đang Rsync Frontend sang VPS..."
rsync -avz --delete \
  client/dist/ $VPS:$REMOTE/client/dist/

# 3. Bắn file Backend qua VPS
echo "3/4 Đang Rsync Backend sang VPS..."
rsync -avz server/routes/customers.js $VPS:$REMOTE/server/routes/customers.js
rsync -avz server/middleware/permCheck.js $VPS:$REMOTE/server/middleware/permCheck.js

# 4. Fix permissions & Restart
echo "4/4 Đang fix quyền truy cập Nginx và Restart PM2..."
ssh $VPS '
  chown -R www-data:www-data /var/www/fittour-crm/server/
  chown -R www-data:www-data /var/www/fittour-crm/client/dist/
  chmod -R 755 /var/www/fittour-crm/server/
  chmod -R 755 /var/www/fittour-crm/client/dist/
  pm2 restart crm-fittour && pm2 logs crm-fittour --lines 5 --nostream
'

echo ""
echo "✅ DEPLOY THÀNH CÔNG TÍNH NĂNG SALE SỬA KHÁCH HÀNG TỚI VPS MỚI!"
echo "═══════════════════════════════════════════"
