# CHANGELOG

## [1.0.0] - 2026-03-14
- [x] Repository refactor for GitHub handoff: removed the outdated TypeScript-first narrative from the main docs and realigned the project around the shipped n8n-first architecture. [ARCHIVE]
- [x] Archived the original hackathon pitch assets under `archive/hackathon-pitch-assets/` to keep the runtime repository focused on the product. [ARCHIVE]
- [x] Added local workflow blueprints and local copies of the important n8n Code node scripts to make the system reproducible on another n8n instance. [ARCHIVE]
- [x] Added local mirrors for previously inline-only workflow logic: pack nodes, demo input nodes, seed event generator, and Qdrant document payload. [ARCHIVE]
- [x] Updated `.gitignore` to exclude local traces, runtime auth state, local env files, and runtime volumes. [ARCHIVE]
- [x] Realigned local deployment guidance around `docker-compose.yml`, `.env.n8n.example`, and the final online/offline n8n setup. [ARCHIVE]
- [x] Extended the self-hosted local stack to include Qdrant so the semantic branch can be recreated without extra infrastructure work. [ARCHIVE]
- [x] Documented the final API contract: `GET /dashboard/brief`, `GET /dashboard/feed`, `GET /dashboard/event?id=...`, `POST /dashboard/action`. [ARCHIVE]
- [x] Documented the WhatsApp bridge pairing-code flow and runtime session behavior. [ARCHIVE]

## [0.4.0] - 2026-03-13
- [x] Architecture pivot: n8n-first. All AI logic lives in n8n Code nodes. No external application server remains in the runtime path. [ARCHIVE]
- [x] Simplified `package.json` so the local Node runtime only serves the WhatsApp bridge. [ARCHIVE]
- [x] Added version-controlled n8n fixtures and initial local Code node exports. [ARCHIVE]
- [x] Added the first WhatsApp-to-n8n bridge based on Baileys pairing flow. [ARCHIVE]

## [0.3.0] - 2026-03-13
- [x] Temporary TypeScript migration prototype created during the hackathon exploration phase. [ARCHIVE]

## [0.2.0] - 2026-03-13
- [x] Project reframing around the school communication problem space, the hackathon challenge, and the first stakeholder model. [ARCHIVE]

## [0.1.0] - 2026-03-13
- [x] Repository initialized with project-level documentation and local setup. [ARCHIVE]
