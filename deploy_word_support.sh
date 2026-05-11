#!/bin/bash
set -e

echo "═══════════════════════════════════════════"
echo "  DEPLOY WORD DOC SUPPORT LÊN VPS MỚI (45.76.144.188)"
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

# 3. Bắn file Controller qua VPS
echo "3/4 Đang Rsync Backend Controller sang VPS..."
rsync -avz server/controllers/hotelController.js $VPS:$REMOTE/server/controllers/hotelController.js
rsync -avz server/controllers/restaurantController.js $VPS:$REMOTE/server/controllers/restaurantController.js
rsync -avz server/controllers/ticketController.js $VPS:$REMOTE/server/controllers/ticketController.js
rsync -avz server/controllers/transportController.js $VPS:$REMOTE/server/controllers/transportController.js

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
echo "✅ DEPLOY THÀNH CÔNG HỖ TRỢ FILE WORD TỚI VPS MỚI!"
echo "═══════════════════════════════════════════"
