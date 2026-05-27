#!/bin/bash
set -e

echo "═══════════════════════════════════════════"
echo "  🚀 DEPLOY BẢN VÁ LỖI ROLE LÊN VPS MỚI (45.76.144.188)"
echo "═══════════════════════════════════════════"

VPS="root@45.76.144.188"
REMOTE="/var/www/fittour-crm"

# 1. Build frontend ở Local
echo "1/4 Đang Build React Frontend..."
cd client
npm run build
cd ..

# 2. Bắn file Frontend qua VPS bằng Rsync
echo "2/4 Đang Rsync Frontend sang VPS..."
rsync -avz --delete --exclude='uploads' \
  client/dist/ $VPS:$REMOTE/client/dist/

# 3. Bắn file Backend qua VPS
echo "3/4 Đang Rsync Backend sang VPS..."
rsync -avz server/controllers/userController.js $VPS:$REMOTE/server/controllers/userController.js
rsync -avz server/migrate_rbac.js $VPS:$REMOTE/server/migrate_rbac.js
rsync -avz server/fix_user_roles.js $VPS:$REMOTE/server/fix_user_roles.js

# 4. Fix permissions, Chạy script fix role, Restart PM2
echo "4/4 Đang chạy Script Phục Hồi Quyền và Restart PM2..."
ssh $VPS '
  echo "- Cấp quyền Nginx..."
  chown -R www-data:www-data /var/www/fittour-crm/server/
  chown -R www-data:www-data /var/www/fittour-crm/client/dist/
  chmod -R 755 /var/www/fittour-crm/server/
  chmod -R 755 /var/www/fittour-crm/client/dist/
  
  echo "- Đang thực thi Script phục hồi Role trên VPS..."
  cd /var/www/fittour-crm/server/
  node fix_user_roles.js
  
  echo "- Restart PM2..."
  pm2 restart crm-fittour && pm2 logs crm-fittour --lines 5 --nostream
'

echo ""
echo "✅ HOÀN TẤT! Toàn bộ lỗi Role đã được sửa và quyền đã được phục hồi!"
echo "═══════════════════════════════════════════"
