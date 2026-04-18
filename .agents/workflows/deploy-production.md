# Deploy Production Workflow

**Description**: Deploy the latest code to the CRM FIT Tour VPS production server. This workflow handles frontend build, backend sync, database migrations, NGINX file permission fixes, and PM2 process restarts.

Invoked when the user says: "deploy", "up", "up lên", "deploy production"

## 1. Build Frontend

Build the Vite application for production. Ensure there are no fatal errors. Warning about chunk sizes is acceptable.

// turbo
```bash
cd client && npx vite build
```

## 2. Sync Frontend to VPS

Synchronize the built static files to the NGINX web directory. Use the `--delete` flag to remove old chunks.

// turbo
```bash
rsync -avz --delete client/dist/ root@64.176.85.168:/var/www/fittour-crm/client/dist/
```

## 3. Sync Backend to VPS

Synchronize the Node.js server to the VPS. IMPORTANT: Exclude node_modules, logs, and env to prevent breaking the production environment setup.

// turbo
```bash
rsync -avz --exclude node_modules --exclude .env --exclude server.log server/ root@64.176.85.168:/var/www/fittour-crm/server/
```

## 4. Run Pending Migrations

Run any new database schema migrations directly on the VPS. Always verify the status output.

// turbo
```bash
ssh root@64.176.85.168 "cd /var/www/fittour-crm/server && if [ -f migrations/run.js ]; then node migrations/run.js; else echo 'No automatic runner found. Run specific .js if needed'; fi"
```

## 5. MUST DO: Fix NGINX Permissions

THIS IS VERY IMPORTANT. After running `rsync`, the uploaded files have `root` ownership. Nginx runs under `www-data`, so it will return a `500 Internal Server Error` (Permission Denied to read index.html) if permissions aren't restored.

// turbo
```bash
ssh root@64.176.85.168 "chown -R www-data:www-data /var/www/fittour-crm/client/dist/"
```

## 6. Restart Server Process

Restart the backend PM2 process to apply new backend code changes.

// turbo
```bash
ssh root@64.176.85.168 "pm2 restart crm-fittour && sleep 3 && pm2 status crm-fittour"
```

## 7. Verify Health

Check the PM2 logs to ensure the server started successfully and did not immediately crash. Look for "Server is running on port 5001" and ensure there are no FATAL errors.

// turbo
```bash
ssh root@64.176.85.168 "pm2 logs crm-fittour --lines 15 --nostream"
```
