#!/usr/bin/env bash
set -euo pipefail

# Local deployment helper for insight hackathon stack.
# It does not start Funnel by itself because Funnel may hit account quota.

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "[1/5] Compose config check"
docker compose config >/dev/null

echo "[2/5] Starting local stack"
docker compose up -d

echo "[3/5] Services status"
docker compose ps

echo "[4/5] Quick n8n health check"
sleep 3
curl -fsS "http://localhost:5678/healthz" || true

echo "[5/5] Next actions"
echo " - n8n UI: http://localhost:5678"
echo " - Set Mongo credential in n8n to: mongodb://mongo:27017/insight"
echo " - Set n8n variables: GEMINI_API_KEY, DISCORD_WEBHOOK_URL"
echo " - Enable workflows after node credential mapping"
echo " - Public URL (if allowed): sudo tailscale funnel 5678"
echo " - Fallback (tailnet-only): sudo tailscale serve --bg 5678"
