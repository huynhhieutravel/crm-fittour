#!/bin/bash
set -e

# 1. Build frontend
echo "Building frontend..."
cd /Volumes/T7\ Loki\ SS/WORK\ Hiếu/crm-fittour/client
npm run build

echo "Syncing frontend to VPS..."
rsync -avz --delete --progress dist/ root@64.176.85.168:/var/www/fittour-crm/client/dist/

echo "Syncing backend to VPS..."
cd /Volumes/T7\ Loki\ SS/WORK\ Hiếu/crm-fittour/server
rsync -avz --progress controllers/ root@64.176.85.168:/var/www/fittour-crm/server/controllers/
rsync -avz --progress migrations/ root@64.176.85.168:/var/www/fittour-crm/server/migrations/

echo "Running Migration on VPS..."
ssh root@64.176.85.168 'cd /var/www/fittour-crm/server && node migrations/migration_add_supplier_ratings.js'

echo "Fixing permissions on VPS..."
ssh root@64.176.85.168 '
  chown -R www-data:www-data /var/www/fittour-crm/server/
  chown -R www-data:www-data /var/www/fittour-crm/client/dist/
  chmod -R 755 /var/www/fittour-crm/server/
  chmod -R 755 /var/www/fittour-crm/client/dist/
'

echo "Restarting PM2 backend..."
ssh root@64.176.85.168 'pm2 restart crm-fittour && sleep 3 && pm2 logs crm-fittour --lines 10 --nostream'

echo "Deployment completed successfully!"
