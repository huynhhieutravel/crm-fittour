# /deploy — Deploy CRM FIT Tour to Production

Deploy code lên VPS production. Workflow này BẮT BUỘC agent phải chạy bước fix permissions.

## Khi nào chạy workflow này?
- User yêu cầu deploy lên production / VPS
- User nói "đẩy code lên", "deploy", "cập nhật production", "rsync lên VPS"
- Sau khi hoàn tất feature lớn và user confirm muốn deploy

// turbo-all

## Bước 1: Build Frontend locally

```bash
cd "/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour/client" && npx vite build
```

Kiểm tra build exit code = 0. Nếu lỗi → DỪNG, sửa trước.

## Bước 2: Git push code lên GitHub

```bash
cd "/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour" && git add -A && git commit -m "deploy: update production" && git push origin main
```

## Bước 3: SSH vào VPS chạy deploy script

```bash
ssh root@64.176.85.168 'cd /var/www/fittour-crm && git pull origin main && cd server && npm install --production && cd ../client && npm install && npm run build'
```

## Bước 4: ⚠️ FIX PERMISSIONS — BẮT BUỘC KHÔNG ĐƯỢC BỎ QUA

> [!CAUTION]
> Nếu bỏ qua bước này, website SẼ BỊ 403 Forbidden.
> Đây là lỗi đã xảy ra NHIỀU LẦN trên production.

```bash
ssh root@64.176.85.168 'chown -R www-data:www-data /var/www/fittour-crm/client/dist/ && chmod -R 755 /var/www/fittour-crm/client/dist/ && chown -R www-data:www-data /var/www/fittour-crm/server/ && chmod -R 755 /var/www/fittour-crm/server/ && echo "✅ Permissions fixed"'
```

**VERIFY** sau khi fix:
```bash
ssh root@64.176.85.168 'stat -c "%U:%G %a" /var/www/fittour-crm/client/dist/index.html'
```
Expected output: `www-data:www-data 755`

Nếu output KHÔNG phải `www-data` → DỪNG và báo user ngay.

## Bước 5: Restart PM2

```bash
ssh root@64.176.85.168 'pm2 restart crm-fittour && sleep 3 && pm2 status crm-fittour'
```

Kiểm tra PM2 status = "online". Nếu không → kiểm tra logs:
```bash
ssh root@64.176.85.168 'pm2 logs crm-fittour --lines 15 --nostream'
```

## Bước 6: Smoke Test

```bash
curl -s -o /dev/null -w "HTTP Status: %{http_code}" https://crm.tournuocngoai.com
```

Expected: `HTTP Status: 200`

Nếu không phải 200 → kiểm tra Nginx error log:
```bash
ssh root@64.176.85.168 'tail -20 /var/log/nginx/error.log'
```

## Bước 7: Báo cáo kết quả

Báo cáo cho user:
- ✅/❌ Build status
- ✅/❌ Permissions fixed & verified
- ✅/❌ PM2 online
- ✅/❌ HTTPS smoke test 200
