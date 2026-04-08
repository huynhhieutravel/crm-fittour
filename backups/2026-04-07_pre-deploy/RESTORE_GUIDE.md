# HƯỚNG DẪN KHÔI PHỤC — Backup ngày 07/04/2026

Ngày tạo: 07/04/2026 07:21 (trước khi deploy OpTours Demo)

## Danh Sách Backup

### 1. Code Local (Git)
- **Commit**: `9c619f8` — "BACKUP: Pre-deploy snapshot OpTours Demo 2026-04-07"
- **Git Stash**: `BACKUP_PRE_DEPLOY_2026-04-07_OpTours_Demo`
- Để khôi phục:
  ```bash
  git reset --hard 9c619f8
  ```

### 2. Database VPS (PostgreSQL v15)
- **Trên VPS**: `/var/www/fittour-crm/_backups/2026-04-07_pre-optours/database_full_backup.dump` (776KB)
- **Bản local**: `backups/2026-04-07_pre-deploy/database_vps_backup.dump`
- Để khôi phục:
  ```bash
  # Trên VPS:
  PGPASSWORD=password_cua_ban /usr/lib/postgresql/15/bin/pg_restore -h localhost -U postgres -d fittour_crm --clean --if-exists /var/www/fittour-crm/_backups/2026-04-07_pre-optours/database_full_backup.dump
  ```

### 3. Code VPS (server + client/dist)
- **Trên VPS**: `/var/www/fittour-crm/_backups/2026-04-07_pre-optours/code_backup.tar.gz` (29MB)
- **Bản local**: `backups/2026-04-07_pre-deploy/code_vps_backup.tar.gz`
- Để khôi phục:
  ```bash
  # Trên VPS:
  cd /var/www/fittour-crm
  tar xzf _backups/2026-04-07_pre-optours/code_backup.tar.gz
  pm2 restart crm-fittour
  ```

## Khôi Phục TOÀN BỘ (nếu cần quay về nguyên trạng 100%)

```bash
# 1. Khôi phục Database
ssh root@64.176.85.168
PGPASSWORD=password_cua_ban /usr/lib/postgresql/15/bin/pg_restore -h localhost -U postgres -d fittour_crm --clean --if-exists /var/www/fittour-crm/_backups/2026-04-07_pre-optours/database_full_backup.dump

# 2. Khôi phục Code VPS
cd /var/www/fittour-crm
tar xzf _backups/2026-04-07_pre-optours/code_backup.tar.gz

# 3. Restart PM2
pm2 restart crm-fittour

# 4. Khôi phục Code Local
git reset --hard 9c619f8
```
