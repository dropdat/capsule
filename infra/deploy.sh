#!/usr/bin/env bash
# Deploy / update dropdat on a remote VPS.
# Usage: ./deploy.sh <HOST> [USER]
#   ./deploy.sh dropdat.app
#   ./deploy.sh 123.45.67.89 ubuntu

set -euo pipefail

HOST="${1:?Usage: ./deploy.sh <HOST> [USER]}"
USER="${2:-root}"
REMOTE_DIR="/opt/dropdat"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building web/out (Next.js static export)"
( cd "$ROOT/web" && npm ci && npm run build )

echo "==> Syncing tree to $USER@$HOST:$REMOTE_DIR"
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'api/bin' \
  --exclude 'infra/data' \
  --exclude '*.env' \
  "$ROOT/" "$USER@$HOST:$REMOTE_DIR/"

echo "==> Bringing stack up"
ssh "$USER@$HOST" "cd $REMOTE_DIR/infra && docker compose up -d --build"

echo "==> Pruning dangling images"
ssh "$USER@$HOST" "docker image prune -f"

echo "==> Status"
ssh "$USER@$HOST" "cd $REMOTE_DIR/infra && docker compose ps"
echo "✓ Deploy complete. https://dropdat.app"
