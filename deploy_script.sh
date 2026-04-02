su - postgres -c "psql -d fittour_crm -c 'ALTER TABLE departure_reminders ADD COLUMN IF NOT EXISTS custom_title VARCHAR(255);'"
cd /var/www/fittour-crm
git pull origin main
cd server
npm install
pm2 restart all
cd ../client
npm install
npm run build
