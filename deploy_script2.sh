cd /var/www/fittour-crm
git stash
git clean -fd
git pull origin main
cd server
npm install
pm2 restart all
cd ../client
npm install
npm run build
