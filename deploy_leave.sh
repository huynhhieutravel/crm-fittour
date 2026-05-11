#!/bin/bash
set -e

echo "═══════════════════════════════════════════"
echo "  DEPLOY TRỰC TIẾP TỪ LOCAL LÊN VPS MỚI (45.76.144.188)"
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
echo "3/5 Đang Rsync Backend & Migration sang VPS..."
rsync -avz server/controllers/leaveController.js $VPS:$REMOTE/server/controllers/leaveController.js
rsync -avz server/migrations/migrate_leave_dates.js $VPS:$REMOTE/server/migrations/migrate_leave_dates.js

# 4. Chạy Migration trên VPS
echo "4/5 Đang chạy Migration Khai tử cột cũ trên VPS..."
ssh $VPS "cd $REMOTE/server && node migrations/migrate_leave_dates.js"

# 5. Fix permissions
echo "5/6 Đang fix quyền truy cập Nginx..."
ssh $VPS '
  chown -R www-data:www-data /var/www/fittour-crm/server/
  chown -R www-data:www-data /var/www/fittour-crm/client/dist/
  chmod -R 755 /var/www/fittour-crm/server/
  chmod -R 755 /var/www/fittour-crm/client/dist/
'

# 6. Restart server Nodejs
echo "6/6 Đang khởi động lại PM2..."
ssh $VPS "pm2 restart crm-fittour && pm2 logs crm-fittour --lines 5 --nostream"

echo ""
echo "✅ DEPLOY THÀNH CÔNG RỰC RỠ TỚI VPS MỚI (CÙNG VỚI MIGRATION DB)!"
echo "═══════════════════════════════════════════"
