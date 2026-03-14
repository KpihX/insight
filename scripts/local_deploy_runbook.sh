#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "[1/6] Checking compose file"
docker compose config >/dev/null

echo "[2/6] Starting MongoDB + Qdrant + n8n"
docker compose up -d

echo "[3/6] Current service status"
docker compose ps

echo "[4/6] Quick n8n health probe"
sleep 3
curl -fsS "http://localhost:5678/healthz" || true

echo "[5/6] Quick Qdrant probe"
curl -fsS "http://localhost:6333/collections" || true

echo "[6/6] Next manual steps"
echo " - Copy .env.n8n.example to .env.n8n and adjust local values if needed."
echo " - Open n8n UI: http://localhost:5678"
echo " - Create MongoDB credential with connection string mongodb://mongo:27017 and database nextgen."
echo " - Create Google Gemini credential."
echo " - Create Qdrant credential with base URL http://qdrant:6333 if you want the vector branch."
echo " - Rebuild workflows using the blueprints in n8n/workflows/ and the local Code node files in n8n/nodes/."
echo " - Run Demo Reset then Demo Seed to initialize local data."
