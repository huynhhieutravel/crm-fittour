#!/bin/bash
set -e

echo "═══════════════════════════════════════════"
echo "  DEPLOY: Tour Đoàn Module → VPS"
echo "═══════════════════════════════════════════"

VPS="root@64.176.85.168"
REMOTE="/var/www/fittour-crm"

# 1. Build
echo "1/5 Building frontend..."
cd client && npx vite build && cd ..

# 2. Rsync server files
echo "2/5 Syncing server files..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  server/ $VPS:$REMOTE/server/

# 3. Rsync client dist
echo "3/5 Syncing client dist..."
rsync -avz --delete \
  client/dist/ $VPS:$REMOTE/client/dist/

# 4. Run migrations on VPS
echo "4/5 Running migrations..."
ssh $VPS "cd $REMOTE/server && node migrations/migration_group_permissions.js && node migrations/fix_group_schemas_and_fks.js && node migrations/migration_permissions_update.js"

# 5. Restart PM2
echo "5/5 Restarting PM2..."
ssh $VPS "cd $REMOTE && chown -R www-data:www-data . && pm2 restart crm-fittour && pm2 logs crm-fittour --lines 5 --nostream"

echo ""
echo "✅ DEPLOY COMPLETE!"
echo "═══════════════════════════════════════════"
