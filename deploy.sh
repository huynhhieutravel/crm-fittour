#!/bin/bash
# ============================================================
# DEPLOY SCRIPT — CRM FIT TOUR
# VPS: 45.76.144.188 (NEW VPS — erp.fittour.vn)
# ============================================================
# KHÔNG BAO GIỜ ĐƯỢC SỬA IP TRONG FILE NÀY.
# KHÔNG BAO GIỜ ĐƯỢC XOÁ --exclude 'public/uploads'.
# ============================================================

set -e  # Dừng ngay nếu có lỗi

VPS="root@45.76.144.188"
REMOTE_PATH="/var/www/fittour-crm"
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║        🚀 DEPLOY CRM FIT TOUR → VPS MỚI        ║"
echo "║           IP: 45.76.144.188                     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ──────────────────────────────────────────────
# STEP 1: Build Frontend
# ──────────────────────────────────────────────
echo "📦 [1/5] Building frontend..."
cd "$PROJECT_ROOT/client"
npm run build
echo "✅ Frontend build thành công."

# ──────────────────────────────────────────────
# STEP 2: Backup uploads từ VPS về local (AN TOÀN)
# ──────────────────────────────────────────────
echo ""
echo "💾 [2/5] Backup uploads từ VPS về local..."
BACKUP_DIR="$PROJECT_ROOT/server/public/uploads"
mkdir -p "$BACKUP_DIR"
rsync -avz "$VPS:$REMOTE_PATH/server/public/uploads/" "$BACKUP_DIR/"
echo "✅ Backup uploads hoàn tất."

# ──────────────────────────────────────────────
# STEP 3: Rsync client/dist (có --delete, an toàn vì chỉ là build output)
# ──────────────────────────────────────────────
echo ""
echo "📤 [3/5] Syncing client/dist..."
cd "$PROJECT_ROOT"
rsync -avz --delete client/dist/ "$VPS:$REMOTE_PATH/client/dist/"
echo "✅ Client sync hoàn tất."

# ──────────────────────────────────────────────
# STEP 4: Rsync server (KHÔNG --delete, EXCLUDE uploads + .env)
# ──────────────────────────────────────────────
echo ""
echo "📤 [4/5] Syncing server (BẢO VỆ uploads + .env)..."
rsync -avz \
  --exclude node_modules \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude 'public/uploads' \
  server/ "$VPS:$REMOTE_PATH/server/"
echo "✅ Server sync hoàn tất (uploads KHÔNG bị đụng tới)."

# ──────────────────────────────────────────────
# STEP 5: Fix permissions + Restart PM2
# ──────────────────────────────────────────────
echo ""
echo "🔐 [5/5] Fix permissions + Restart PM2..."
ssh "$VPS" "
  chown -R www-data:www-data $REMOTE_PATH/client/dist/
  chmod -R 755 $REMOTE_PATH/client/dist/
  chown -R www-data:www-data $REMOTE_PATH/server/
  chmod -R 755 $REMOTE_PATH/server/
  pm2 restart crm-fittour
"

# Verify
echo ""
echo "🔍 Kiểm tra PM2 status..."
ssh "$VPS" "pm2 status crm-fittour"

echo ""
echo "🔍 Smoke test https://erp.fittour.vn..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://erp.fittour.vn)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ erp.fittour.vn trả HTTP $HTTP_CODE — THÀNH CÔNG!"
else
  echo "❌ erp.fittour.vn trả HTTP $HTTP_CODE — CÓ VẤN ĐỀ!"
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║           ✅ DEPLOY HOÀN TẤT THÀNH CÔNG         ║"
echo "╚══════════════════════════════════════════════════╝"
