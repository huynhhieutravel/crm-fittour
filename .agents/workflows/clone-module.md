---
description: Clone a new supplier module (NCC) from template — generates backend + migration + integration guide with zero manual copy-paste
---

# /clone-module — Tạo Module NCC Mới

## Quy trình chuẩn — KHÔNG được bỏ bước nào

### PHASE 1: CHUẨN BỊ CONFIG (2 phút)

1. Copy template config:
```bash
cp server/scripts/configs/_template.json server/scripts/configs/MODULE_NAME.json
```

2. Chỉnh sửa config file — thay đổi CÁC TRƯỜNG SAU:
   - `module_name`: tên module (viết thường, không dấu): `"transport"`, `"ticket"`, `"airline"`
   - `module_name_vi`: tên tiếng Việt: `"Nhà xe"`, `"Vé tham quan"`, `"Hãng hàng không"`
   - `table_prefix`: tên bảng (số nhiều): `"transports"`, `"tickets"`, `"airlines"`
   - `icon`: icon từ Lucide React: `"Truck"`, `"Ticket"`, `"Plane"`
   - `entity_fields`: các cột riêng của entity (thay `vehicle_type` → field phù hợp)
   - `service_fields`: các cột dịch vụ con
   - `contact_fields`: giữ nguyên (name, position, phone, email)

### PHASE 2: GENERATE BACKEND (1 phút)

// turbo
3. Chạy generator:
```bash
cd server && node scripts/generate_module.js --config scripts/configs/MODULE_NAME.json
```

4. ĐỌC KỸ integration guide được in ra terminal — đây là checklist thủ công cần làm.

### PHASE 3: TÍCH HỢP APP.JSX (5 phút)

5. Mở `client/src/App.jsx` và thêm **CHÍNH XÁC** các đoạn sau (theo integration guide):
   - Import tab component
   - State `moduleToDelete`
   - Delete function (dùng `?force=true`, KHÔNG `window.confirm`)
   - Tab render condition
   - Delete modal condition

> ⚠️  LUÔN dùng pattern `?force=true` — KHÔNG BAO GIỜ dùng `window.confirm()`

### PHASE 4: CLONE FRONTEND (10 phút)

6. Copy RestaurantsTab.jsx → ModulesTab.jsx
7. Find-Replace trong file mới:
   - `restaurant` → `module_name`
   - `Restaurant` → `ModuleName`
   - `Restaurants` → `ModuleNames`
   - `nhà hàng` → `tên module tiếng Việt`
   - `Nhà hàng` → `Tên module tiếng Việt`
   - `cuisine_type` → field riêng của module mới
   - `restaurant_class` → class field riêng
   - `UtensilsCrossed` → icon mới
   - `reloadRestaurants` → `reloadModuleNames`

8. Copy RestaurantDetailDrawer.jsx → ModuleDetailDrawer.jsx
9. Thực hiện CÙNG find-replace như bước 7

### PHASE 5: KIỂM TRA LOCAL (5 phút)

// turbo
10. Restart server:
```bash
# Kill server cũ rồi start lại
npm start
```

11. Test trên localhost:
   - Trang list load không lỗi
   - Tạo mới 1 record → thành công
   - Sửa record → thành công
   - Xóa record → modal hiện đúng → xóa thành công
   - Toast notification hiện trên drawer (z-index OK)

// turbo
12. Build frontend:
```bash
cd client && npm run build
```

### PHASE 6: DEPLOY VPS (5 phút) — ĐÚNG THỨ TỰ

// turbo
13. Sync server files:
```bash
rsync -avz server/controllers/moduleController.js root@64.176.85.168:/var/www/fittour-crm/server/controllers/
rsync -avz server/routes/modules.js root@64.176.85.168:/var/www/fittour-crm/server/routes/
rsync -avz server/migrations/migration_modules.js root@64.176.85.168:/var/www/fittour-crm/server/migrations/
rsync -avz server/index.js root@64.176.85.168:/var/www/fittour-crm/server/
```

// turbo
14. Sync frontend build:
```bash
rsync -avz --delete client/dist/ root@64.176.85.168:/var/www/fittour-crm/client/dist/
```

15. **BẮT BUỘC** Fix permissions:
```bash
ssh root@64.176.85.168 '
  chown -R www-data:www-data /var/www/fittour-crm/server/
  chown -R www-data:www-data /var/www/fittour-crm/client/dist/
  chmod -R 755 /var/www/fittour-crm/server/
  chmod -R 755 /var/www/fittour-crm/client/dist/
'
```

// turbo
16. Verify files exist:
```bash
ssh root@64.176.85.168 '
  ls -la /var/www/fittour-crm/server/controllers/moduleController.js
  ls -la /var/www/fittour-crm/server/routes/modules.js
  grep "module" /var/www/fittour-crm/server/index.js
'
```

17. Run migration:
```bash
ssh root@64.176.85.168 'cd /var/www/fittour-crm/server && node migrations/migration_modules.js'
```

// turbo
18. Verify tables:
```bash
ssh root@64.176.85.168 'PGPASSWORD=password_cua_ban psql -h localhost -U postgres -d fittour_crm -c "\dt *module*"'
```

// turbo
19. Syntax check:
```bash
ssh root@64.176.85.168 'node -e "require(\"/var/www/fittour-crm/server/controllers/moduleController.js\")"'
```

20. **CHỈ SAU KHI TẤT CẢ BƯỚC TRÊN OK** → Restart PM2:
```bash
ssh root@64.176.85.168 'pm2 restart crm-fittour && sleep 3 && pm2 status crm-fittour'
```

// turbo
21. Check logs:
```bash
ssh root@64.176.85.168 'pm2 logs crm-fittour --lines 10 --nostream'
```

22. Smoke test trên browser: https://crm.tournuocngoai.com/modules

## ⚠️ KHÔNG BAO GIỜ LÀM

- ❌ KHÔNG restart PM2 trước khi verify files exist
- ❌ KHÔNG dùng `window.confirm()` hoặc `alert()` trong React
- ❌ KHÔNG quên `chown www-data:www-data` sau rsync
- ❌ KHÔNG quên chạy migration trước restart
- ❌ KHÔNG copy hotel columns (sku, max_occupancy, dob, build_year) sang module khác
- ❌ KHÔNG đặt tên function `createRoomType` cho module không phải hotel
